// routes/message.routes.js
const express = require("express");
const MessageRouter = express.Router();
const { authenticate } = require("../middleware/auth");
const OpenAI = require("openai");
const { MessageModel } = require("../model/message.model");
const { streamRunStatus } = require("../utils/streamhandler");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get messages for authenticated user
MessageRouter.get("/", authenticate, async (req, res) => {
  try {
    const userData = await MessageModel.findOne({ userId: req.user.userId });
    if (!userData?.threadId) return res.json({ messages: [] });

    const messages = userData.messages || [];
    res.json({
      messages: messages.slice(-25).map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send message and get AI response
MessageRouter.post("/", authenticate, async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Ensure assistant is initialized
    if (!global.assistant) {
      throw new Error("Assistant not initialized");
    }

    // Get or create thread
    let userData = await MessageModel.findOne({ userId: req.user.userId });
    let threadId = userData?.threadId;

    if (!threadId) {
      const newThread = await openai.beta.threads.create();
      threadId = newThread.id;
      userData = await MessageModel.create({
        userId: req.user.userId,
        threadId,
        messages: [],
      });
    }

    // Store user message
    await MessageModel.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $push: {
          messages: {
            role: "user",
            content: message.trim(),
            timestamp: new Date(),
          },
        },
      }
    );

    // Add message to OpenAI thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message.trim(),
    });

    // Create run
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: global.assistant.id,
    });

    // Set up SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream response
    streamRunStatus(req, res, threadId, run.id, req.user.userId);
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({
      error: "Failed to process message",
      details: error.message,
    });
  }
});

// Delete conversation history
MessageRouter.delete("/history", authenticate, async (req, res) => {
  try {
    await MessageModel.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: { messages: [] } }
    );
    res.json({ message: "Conversation history cleared" });
  } catch (error) {
    console.error("Error clearing history:", error);
    res.status(500).json({ error: "Failed to clear history" });
  }
});

module.exports = { MessageRouter };
