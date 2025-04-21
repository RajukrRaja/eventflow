const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (requiredRole) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Optional: Check role if requiredRole is passed
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden: Insufficient role' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
};

module.exports = auth;
