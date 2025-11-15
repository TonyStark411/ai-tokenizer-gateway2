// middleware/adminCheck.js - Admin Verification Middleware

const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (req.user.walletAddress.toLowerCase() !== process.env.ADMIN_WALLET.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Admin verification failed'
    });
  }
};

module.exports = adminMiddleware;