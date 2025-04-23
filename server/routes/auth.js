const express = require('express');
const {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
} = require('../controllers/authController');

const router = express.Router();

router.get('/profile', getProfile);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/register', registerUser);

module.exports = router;
