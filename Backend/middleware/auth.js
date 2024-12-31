const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware for user authentication and tokens

const auth = (req, res, next) => {
  // Get token from the 'Authorization' header 
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle token expiration 
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ msg: 'Token has expired' });
    }

    // Attach user to requests
    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    res.status(401).json({ msg: 'Invalid token' });
  }
};

module.exports = auth;
