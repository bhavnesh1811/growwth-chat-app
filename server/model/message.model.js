// models/message.model.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    ref: 'user' 
  },
  threadId: { 
    type: String, 
    required: true 
  },
  messages: [{
    role: { 
      type: String, 
      required: true,
      enum: ['user', 'assistant'] 
    },
    content: { 
      type: String, 
      required: true 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { 
  timestamps: true,
  versionKey: false 
});

// Index for faster queries
messageSchema.index({ userId: 1, threadId: 1 });

const MessageModel = mongoose.model("message", messageSchema);

module.exports = { MessageModel };