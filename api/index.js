const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { parse } = require('cookie');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const { Server } = require('socket.io');

const jwtSecret = process.env.JWT_SECRET;

mongoose.connect(process.env.MONGO_URL);
const clientUrl = process.env.CLIENT_URL;
const port = process.env.PORT || 8000;
let activeConnections = {};

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

// Message routes
app.use('/messages', messageRoutes);

// Start server
const server = app.listen(port, () => {
  console.log('Server is running on port 8000');
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Function to notify all clients about online users
function notifyOnlineUsers() {
  const onlineUsers = [...io.sockets.sockets.values()].map((s) => ({
    userId: s.userId,
    username: s.username,
  }));
  io.emit('onlineUsers', onlineUsers);
}

io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie;
  if (cookieHeader) {
    const cookies = parse(cookieHeader || '');
    socket.token = cookies['token'];
  }
  next();
});

io.on('connection', (socket) => {
  jwt.verify(socket.token, jwtSecret, {}, (err, user) => {
    if (err) {
      console.error('Socket verification error:', err);
      // socket.disconnect();
      return;
    }
    // Attach user info to the socket
    socket.userId = user.userId;
    socket.username = user.username; // Assuming username is in the token payload

    console.log(
      'A user connected with id:',
      socket.userId,
      'and name:',
      socket.username
    );

    // Notify all clients about the updated online user list
    notifyOnlineUsers();

    // Join a room specific to this user
    socket.join(user.userId);
  });

  // Handle new message event
  socket.on('sendMessage', async ({ recipientId, content }) => {
    if (!socket.userId) return;

    try {
      const Message = require('./models/Message');
      const User = require('./models/User');

      // Create new message in database
      const newMessage = await Message.create({
        sender: socket.userId,
        recipient: recipientId,
        content: content.trim(),
      });

      // Populate sender and recipient info
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'username')
        .populate('recipient', 'username');

      // Emit to both sender and recipient
      io.to(socket.userId).emit('newMessage', populatedMessage);
      io.to(recipientId).emit('newMessage', populatedMessage);

      console.log(`Message sent from ${socket.username} to ${recipientId}`);
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(
      'User disconnected with id:',
      socket.userId,
      'and name:',
      socket.username
    );
    // Notify all clients about the updated online user list
    // Need a slight delay to ensure the socket is fully removed before notifying
    setTimeout(notifyOnlineUsers, 100);
  });
});
