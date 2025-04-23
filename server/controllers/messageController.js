const Message = require('../models/Message');

// Send a message to a recipient
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.userId; // From auth middleware

    if (!recipientId || !content) {
      return res
        .status(400)
        .json({ error: 'Recipient ID and content are required' });
    }

    // Create and save the message
    const newMessage = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content: content.trim(),
    });

    // Populate sender information for the response
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username')
      .populate('recipient', 'username');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get messages between current user and another user
const getMessages = async (req, res) => {
  try {
    const { userId } = req;
    const { otherUserId } = req.params;

    if (!otherUserId) {
      return res.status(400).json({ error: 'Other user ID is required' });
    }

    // Find messages where current user is either sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId },
      ],
    })
      .sort({ createdAt: 1 }) // Sort by creation time ascending
      .populate('sender', 'username')
      .populate('recipient', 'username');

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
