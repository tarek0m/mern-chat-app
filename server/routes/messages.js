const express = require('express');
const {
  sendMessage,
  getMessages,
} = require('../controllers/messageController');

// Middleware to verify JWT token and attach user data to request
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const jwt = require('jsonwebtoken');
  const jwtSecret = process.env.JWT_SECRET;

  jwt.verify(token, jwtSecret, {}, (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = userData.userId;
    req.username = userData.username;
    next();
  });
};

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Message routes
router.post('/send', sendMessage);
router.get('/:otherUserId', getMessages);

module.exports = router;
