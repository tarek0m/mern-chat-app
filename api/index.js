const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

mongoose.connect(process.env.MONGO_URL);
const clientUrl = process.env.CLIENT_URL;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: clientUrl,
  })
);

// Test route
app.get('/test', (req, res) => {
  res.json('test ok');
});

// Auth routes
app.use('/', authRoutes);

app.listen(8000);
