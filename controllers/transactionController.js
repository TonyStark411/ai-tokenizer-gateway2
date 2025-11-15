// controllers/transactionController.js - Purchase & Transaction Logic

const { ethers } = require('ethers');
const { v4: uuidv4 } = require('uuid');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Service = require('../models/Service');
const APIKey = require('../models/APIKey');
const { aitkTokenContract, routerWithSigner, provider } = require('../config/blockchain');

// Get User's AITK Balance
exports.getBalance = async (req, res) => {
  try {
    const { walletAddress } = req.user;

    // Get balance from blockchain
    const balanceWei = await aitkTokenContract.balanceOf(walletAddress);
    const balanceAITK = ethers.formatEther(balanceWei);

    // Also store in DB for tracking
    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { balance: parseFloat(balanceAITK) }
    );

    res.json({
      success: true,
      balance: balanceAITK,
      balanceUSD: (parseFloat(balanceAITK) * 1.50).toFixed(2), // Example: $1.50 per AITK
      tokenAddress: process.env.AITK_TOKEN_ADDRESS,
      networkId: 137,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Balance Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Initiate Purchase - Return transaction details
exports.initiateTransaction = async (req, res) => {
  try {
    const { walletAddress } = req.user;
    const { serviceId, packageType, quantity } = req.body;

    // Validate inputs
    if (!serviceId || !packageType) {
      return res.status(400).json({
        success: false,
        error: 'serviceId and packageType required'
      });
    }

    // Get service
    const service = await Service.findOne({ serviceId });
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Calculate cost based on package type
    let cost = 0;
    const packages = {
      'Starter': { tokens: 1000, multiplier: 1 },
      'Pro': { tokens: 10000, multiplier: 0.8 },
      'Enterprise': { tokens: 100000, multiplier: 0.5 }
    };

    if (!packages[packageType]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid package type'
      });
    }

    // Calculate total cost
    const pkg = packages[packageType];
    const inputCost = (service.priceInput / 1000000) * pkg.tokens * quantity;
    const totalCost = inputCost * pkg.multiplier;

    // Check user balance
    const balanceWei = await aitkTokenContract.balanceOf(walletAddress);
    const balanceAITK = parseFloat(ethers.formatEther(balanceWei));

    if (balanceAITK < totalCost) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient AITK balance',
        required: totalCost,
        available: balanceAITK
      });
    }

    // Create purchase ID
    const purchaseId = `purchase_${uuidv4()}`;

    // Create transaction record
    const transaction = new Transaction({
      transactionId: `tx_${uuidv4()}`,
      purchaseId,
      walletAddress: walletAddress.toLowerCase(),
      serviceId,
      serviceName: service.name,
      amount: totalCost,
      status: 'pending',
      createdAt: new Date()
    });

    await transaction.save();

    // Return transaction details with Web3 instructions
    res.json({
      success: true,
      transactionId: transaction.transactionId,
      purchaseId,
      serviceName: service.name,
      packageType,
      totalTokens: pkg.tokens * quantity,
      totalCost,
      costBreakdown: {
        inputCost,
        discount: inputCost - (inputCost * pkg.multiplier),
        finalCost: totalCost
      },
      steps: [
        {
          step: 1,
          title: 'Approve AITK Tokens',
          action: 'approve',
          contract: process.env.AITK_TOKEN_ADDRESS,
          function: 'approve',
          params: {
            spender: process.env.ROUTER_ADDRESS,
            amount: ethers.parseEther(totalCost.toString())
          },
          description: 'First, approve the Router to spend AITK tokens'
        },
        {
          step: 2,
          title: 'Execute Purchase',
          action: 'purchase',
          contract: process.env.ROUTER_ADDRESS,
          function: 'purchaseService',
          params: {
            serviceId: ethers.id(serviceId),
            purchaseId: ethers.id(purchaseId),
            user: walletAddress,
            amount: ethers.parseEther(totalCost.toString())
          },
          description: 'Execute the purchase transaction'
        }
      ],
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Transaction Init Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Confirm Purchase - After transaction is mined
exports.confirmTransaction = async (req, res) => {
  try {
    const { walletAddress } = req.user;
    const { purchaseId, txHash, blockNumber } = req.body;

    if (!purchaseId || !txHash) {
      return res.status(400).json({
        success: false,
        error: 'purchaseId and txHash required'
      });
    }

    // Find transaction
    const transaction = await Transaction.findOne({ purchaseId });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Verify transaction hash
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      return res.status(400).json({
        success: false,
        error: 'Transaction not confirmed on blockchain'
      });
    }

    // Update transaction record
    transaction.status = 'completed';
    transaction.txHash = txHash;
    transaction.blockNumber = blockNumber || receipt.blockNumber;
    transaction.blockExplorer = `https://polygonscan.com/tx/${txHash}`;
    transaction.completedAt = new Date();
    await transaction.save();

    // Update user stats
    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { 
        $inc: { 
          totalSpent: transaction.amount,
          servicesCount: 1
        }
      }
    );

    // Generate API Key
    const apiKey = `sk_live_aitk_${uuidv4().replace(/-/g, '')}`;
    const accessToken = `token_${uuidv4()}`;
    
    const apiKeyRecord = new APIKey({
      keyId: `key_${uuidv4()}`,
      walletAddress: walletAddress.toLowerCase(),
      serviceId: transaction.serviceId,
      key: apiKey, // In production, hash this
      accessToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'active'
    });

    await apiKeyRecord.save();

    // Get service details
    const service = await Service.findOne({ serviceId: transaction.serviceId });

    res.json({
      success: true,
      message: 'Purchase confirmed successfully',
      purchaseId,
      transactionHash: txHash,
      blockExplorer: `https://polygonscan.com/tx/${txHash}`,
      apiKey: apiKey.substring(0, 20) + '...',
      fullApiKey: apiKey, // Send full key to user
      accessToken,
      expiresIn: 2592000, // 30 days in seconds
      serviceDetails: {
        name: service.name,
        provider: service.provider,
        endpoint: service.apiEndpoint,
        documentation: service.documentation,
        features: service.features
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Confirm Transaction Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get Transaction History
exports.getTransactionHistory = async (req, res) => {
  try {
    const { walletAddress } = req.user;
    const { limit = 20, offset = 0 } = req.query;

    const transactions = await Transaction.find({
      walletAddress: walletAddress.toLowerCase()
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Transaction.countDocuments({
      walletAddress: walletAddress.toLowerCase()
    });

    const formattedTransactions = transactions.map(tx => ({
      transactionId: tx.transactionId,
      purchaseId: tx.purchaseId,
      serviceName: tx.serviceName,
      amount: tx.amount,
      status: tx.status,
      date: tx.createdAt,
      txHash: tx.txHash,
      blockExplorer: tx.blockExplorer
    }));

    res.json({
      success: true,
      total,
      transactions: formattedTransactions,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};