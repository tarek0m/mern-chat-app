const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model('Message', MessageSchema);
module.exports = MessageModel;
