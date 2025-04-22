const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET;

const getProfile = (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) {
        console.error('Profile verification error:', err);
        return res.status(401).json('token verification failed');
      }
      res.json(userData);
    });
  } else {
    res.status(401).json('no token');
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const foundUser = await User.findOne({ username });
    if (foundUser) {
      const isPassed = bcrypt.compareSync(password, foundUser.password);
      if (isPassed) {
        jwt.sign(
          { userId: foundUser._id, username: username },
          jwtSecret,
          {},
          (err, token) => {
            if (err) throw err;
            res
              .cookie('token', token, { secure: true, sameSite: 'none' })
              .status(200)
              .json({
                id: foundUser._id,
                success: 'Logged in successfully',
              });
          }
        );
      } else {
        res.status(401).json({ error: 'Wrong password' });
      }
    } else {
      res.status(401).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
};

const logoutUser = (req, res) => {
  res.cookie('token', '', { secure: true, sameSite: 'none' }).json('ok');
};

const registerUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const createdUser = await User.create({
      username,
      password, // Password hashing is handled by the pre-save hook in User model
    });
    jwt.sign(
      { userId: createdUser._id, username: username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie('token', token, { secure: true, sameSite: 'none' })
          .status(201)
          .json({
            id: createdUser._id,
            success: 'User registered successfully',
          });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    let statusCode = 500;
    let errorMessage = 'An error occurred during registration';

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      statusCode = 409; // Conflict
      errorMessage = 'Username already exists';
    } else if (error.name === 'ValidationError') {
      statusCode = 400; // Bad Request
      errorMessage =
        'Validation failed: ' +
        Object.values(error.errors)
          .map((err) => err.message)
          .join(', ');
    } else if (error.name === 'MongoNetworkError') {
      statusCode = 503; // Service Unavailable
      errorMessage = 'Database connection error';
    }

    res.status(statusCode).json({ error: errorMessage });
  }
};

module.exports = {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
};
