// controllers/authController.js - Authentication Controller

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ethers } = require('ethers');

exports.connectWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }

    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        isAdmin: walletAddress.toLowerCase() === process.env.ADMIN_WALLET.toLowerCase()
      });
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const authToken = jwt.sign(
      { walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      authToken,
      user: {
        walletAddress: user.walletAddress,
        balance: user.balance,
        isAdmin: user.isAdmin,
        totalSpent: user.totalSpent
      }
    });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        balance: user.balance,
        totalSpent: user.totalSpent,
        servicesCount: user.servicesCount,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};