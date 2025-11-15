// models/Service.js - AI Service Database Model

const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['LLM', 'Vision', 'Audio', 'Video', 'Multimodal']
  },
  description: String,
  priceInput: {
    type: Number,
    required: true
  },
  priceOutput: Number,
  contextWindow: {
    type: Number,
    default: 128000
  },
  rating: {
    type: Number,
    default: 4.5
  },
  userCount: {
    type: Number,
    default: 0
  },
  logoUrl: String,
  documentation: String,
  apiEndpoint: String,
  features: [String],
  isFree: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', ServiceSchema);