// controllers/serviceController.js - Service Management

const Service = require('../models/Service');
const User = require('../models/User');

// Get All Services with Filters
exports.getAllServices = async (req, res) => {
  try {
    const { 
      category, 
      provider, 
      sortBy = 'popularity',
      limit = 50,
      offset = 0,
      priceMax,
      priceMin
    } = req.query;

    // Build filter
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (provider) filter.provider = provider;
    
    if (priceMin || priceMax) {
      filter.priceInput = {};
      if (priceMin) filter.priceInput.$gte = parseFloat(priceMin);
      if (priceMax) filter.priceInput.$lte = parseFloat(priceMax);
    }

    // Build sort
    let sort = { userCount: -1 }; // Default: most popular
    if (sortBy === 'price-low') sort = { priceInput: 1 };
    if (sortBy === 'price-high') sort = { priceInput: -1 };
    if (sortBy === 'newest') sort = { createdAt: -1 };
    if (sortBy === 'rating') sort = { rating: -1 };

    // Query
    const services = await Service.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Service.countDocuments(filter);

    res.json({
      success: true,
      total,
      services,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get Services Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get Service Details
exports.getServiceDetails = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findOne({ serviceId });
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      service: {
        ...service.toObject(),
        pricing: {
          input: service.priceInput,
          output: service.priceOutput,
          packages: [
            { name: 'Starter', tokens: 1000, cost: (service.priceInput / 1000000) * 1000 },
            { name: 'Pro', tokens: 10000, cost: (service.priceInput / 1000000) * 10000 * 0.8 },
            { name: 'Enterprise', tokens: 100000, cost: (service.priceInput / 1000000) * 100000 * 0.5 }
          ]
        }
      }
    });
  } catch (error) {
    console.error('Service Details Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Search Services
exports.searchServices = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query too short (minimum 2 characters)'
      });
    }

    const services = await Service.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { provider: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);

    res.json({
      success: true,
      query: q,
      results: services.length,
      services
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Register New Service (Admin Only)
exports.registerService = async (req, res) => {
  try {
    const { walletAddress } = req.user;
    
    // Check if admin
    if (walletAddress.toLowerCase() !== process.env.ADMIN_WALLET.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const {
      name,
      provider,
      category,
      description,
      priceInput,
      priceOutput,
      contextWindow,
      logoUrl,
      documentation,
      apiEndpoint,
      features
    } = req.body;

    // Validate required fields
    if (!name || !provider || !category || !priceInput) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, provider, category, priceInput'
      });
    }

    // Generate service ID
    const serviceId = `${provider.toLowerCase()}_${name.toLowerCase().replace(/\\s+/g, '_')}_${Date.now()}`;

    // Check if already exists
    const exists = await Service.findOne({ serviceId });
    if (exists) {
      return res.status(400).json({
        success: false,
        error: 'Service already exists'
      });
    }

    // Create service
    const service = new Service({
      serviceId,
      name,
      provider,
      category,
      description,
      priceInput: parseFloat(priceInput),
      priceOutput: parseFloat(priceOutput || priceInput),
      contextWindow: parseInt(contextWindow || 128000),
      logoUrl,
      documentation,
      apiEndpoint,
      features: features || [],
      isActive: true,
      isFree: parseFloat(priceInput) === 0
    });

    await service.save();

    res.json({
      success: true,
      message: 'Service registered successfully',
      serviceId,
      service
    });
  } catch (error) {
    console.error('Register Service Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};