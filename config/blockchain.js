// config/blockchain.js - Blockchain Configuration

const { ethers } = require('ethers');
require('dotenv').config();

// ABI for AITK Token (ERC20)
const AITK_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// ABI for Router Contract
const ROUTER_ABI = [
  'function purchaseService(bytes32 serviceId, bytes32 purchaseId, address user, uint256 amount) external payable returns (bool)',
  'function getServicePrice(bytes32 serviceId) external view returns (uint256)',
  'function confirmPurchase(bytes32 purchaseId) external returns (bool)',
  'event ServicePurchased(bytes32 indexed serviceId, address indexed user, uint256 amount, bytes32 purchaseId)'
];

// Initialize Web3 Provider
const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com');

// Initialize Wallet
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract Instances
const aitkTokenContract = new ethers.Contract(
  process.env.AITK_TOKEN_ADDRESS,
  AITK_ABI,
  provider
);

const routerContract = new ethers.Contract(
  process.env.ROUTER_ADDRESS,
  ROUTER_ABI,
  provider
);

// Get contract with signer for write operations
const aitkWithSigner = aitkTokenContract.connect(wallet);
const routerWithSigner = routerContract.connect(wallet);

module.exports = {
  provider,
  wallet,
  aitkTokenContract,
  routerContract,
  aitkWithSigner,
  routerWithSigner,
  AITK_ABI,
  ROUTER_ABI,
  AITK_ADDRESS: process.env.AITK_TOKEN_ADDRESS,
  ROUTER_ADDRESS: process.env.ROUTER_ADDRESS
};
