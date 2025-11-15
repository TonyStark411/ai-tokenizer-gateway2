// models/APIKey.js - API Key Database Model

const mongoose = require('mongoose');

const APIKeySchema = new mongoose.Schema({
  keyId: {
    type: String,
    required: true,
    unique: true
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true
  },
  serviceId: String,
  key: {
    type: String,
    required: true
  },
  accessToken: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  lastUsed: Date,
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  uses: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('APIKey', APIKeySchema);