// index.js
require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");
const app = express();
const { connection } = require("./config/db");
const { MessageModel } = require("./model/message.model");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load financial data
const financialData = {
  "revenue": {
    "march": 50000,
    "april": 60000,
    "forecast": 55000
  },
  "expenses": {
    "march": 20000,
    "april": 25000,
    "forecast": 23000
  }
};

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "user-id"],
}));

// Function to get financial data
async function getFinancialData(type, period) {
  if (!financialData[type]) {
    throw new Error(`Invalid data type: ${type}`);
  }
  
  if (period && !financialData[type][period]) {
    throw new Error(`Data not available for period: ${period}`);
  }
  
  return period ? financialData[type][period] : financialData[type];
}

// Initialize assistant with enhanced instructions
async function initializeAssistant() {
  try {
    return await openai.beta.assistants.create({
      name: "Financial Advisor",
      instructions: `You are a professional financial advisor with expertise in analyzing business metrics and providing actionable insights. 

Key responsibilities:
1. Analyze financial data including revenue, expenses, and forecasts
2. Provide clear, data-driven advice using markdown formatting
3. Include specific numbers and percentage changes in your analysis
4. Focus on trends, patterns, and actionable recommendations
5. Be concise but thorough in your explanations

When formatting responses:
- Use markdown headers (# ## ###) to organize information
- Present key metrics in bullet points
- Use bold for important numbers and insights
- Include percentage changes when comparing periods
- Format large numbers with appropriate commas

Always provide context for your recommendations and explain the reasoning behind your analysis.`,
      model: "gpt-4-turbo-preview",
      tools: [{
        type: "function",
        function: {
          name: "get_financial_data",
          description: "Retrieve financial data for analysis",
          parameters: {
            type: "object",
            properties: {
              type: { 
                type: "string", 
                enum: ["revenue", "expenses"],
                description: "Type of financial data to retrieve"
              },
              period: { 
                type: "string", 
                enum: ["march", "april", "forecast"],
                description: "Specific time period for the data"
              }
            },
            required: ["type"]
          }
        }
      }]
    });
  } catch (error) {
    console.error("Error initializing assistant:", error);
    throw error;
  }
}

let globalAssistant = null;

// Function to handle required actions during run
async function handleRequiredAction(runStatus, threadId, runId) {
  const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
  const toolOutputs = [];

  for (const toolCall of toolCalls) {
    if (toolCall.function.name === "get_financial_data") {
      const args = JSON.parse(toolCall.function.arguments);
      try {
        const data = await getFinancialData(args.type, args.period);
        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify(data)
        });
      } catch (error) {
        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify({ error: error.message })
        });
      }
    }
  }

  return await openai.beta.threads.runs.submitToolOutputs(
    threadId,
    runId,
    { tool_outputs: toolOutputs }
  );
}

// Enhanced run status checking with streaming and message storage
async function streamRunStatus(req, res, threadId, runId, userId) {
  const maxChecks = 30;
  const checkInterval = 1000;
  let checkCount = 0;

  const checkStatus = async () => {
    try {
      checkCount++;
      const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

      switch (runStatus.status) {
        case "completed":
          const messages = await openai.beta.threads.messages.list(threadId);
          const lastMessage = messages.data[0].content[0].text.value;
          
          // Store assistant's response in MongoDB
          await MessageModel.findOneAndUpdate(
            { userId },
            { 
              $push: { 
                messages: {
                  role: "assistant",
                  content: lastMessage,
                  timestamp: new Date()
                }
              }
            }
          );

          res.write(`data: ${JSON.stringify({ type: 'message', content: lastMessage })}\n\n`);
          res.end();
          break;

        case "requires_action":
          res.write(`data: ${JSON.stringify({ type: 'status', content: 'Processing data request...' })}\n\n`);
          await handleRequiredAction(runStatus, threadId, runId);
          setTimeout(checkStatus, checkInterval);
          break;

        case "failed":
        case "cancelled":
        case "expired":
          res.write(`data: ${JSON.stringify({ 
            type: 'error', 
            content: `Analysis ${runStatus.status}` 
          })}\n\n`);
          res.end();
          break;

        default:
          if (checkCount >= maxChecks) {
            res.write(`data: ${JSON.stringify({ 
              type: 'error', 
              content: 'Request timed out' 
            })}\n\n`);
            res.end();
          } else {
            res.write(`data: ${JSON.stringify({ 
              type: 'status', 
              content: `Analyzing (${checkCount}/${maxChecks})...` 
            })}\n\n`);
            setTimeout(checkStatus, checkInterval);
          }
      }
    } catch (error) {
      console.error("Error in run status check:", error);
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        content: 'Error during analysis' 
      })}\n\n`);
      res.end();
    }
  };

  checkStatus();
}

// Enhanced chat endpoint with message storage
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  const userId = req.headers["user-id"];

  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Ensure assistant is initialized
    if (!globalAssistant) {
      globalAssistant = await initializeAssistant();
    }

    // Get or create thread
    let userData = await MessageModel.findOne({ userId });
    let threadId = userData?.threadId;

    if (!threadId) {
      const newThread = await openai.beta.threads.create();
      threadId = newThread.id;
      userData = await MessageModel.create({ 
        userId, 
        threadId,
        messages: []
      });
    }

    // Store user message in MongoDB
    await MessageModel.findOneAndUpdate(
      { userId },
      { 
        $push: { 
          messages: {
            role: "user",
            content: message.trim(),
            timestamp: new Date()
          }
        }
      }
    );

    // Add message to OpenAI thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message.trim()
    });

    // Create run
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: globalAssistant.id
    });

    // Set up SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream response
    streamRunStatus(req, res, threadId, run.id, userId);

  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ 
      error: "Failed to process message", 
      details: error.message 
    });
  }
});

// Enhanced messages endpoint with MongoDB storage
app.get("/api/messages", async (req, res) => {
  const userId = req.headers["user-id"];
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  try {
    const userData = await MessageModel.findOne({ userId });
    if (!userData?.threadId) return res.json({ messages: [] });

    // Return messages from MongoDB
    const messages = userData.messages || [];
    res.json({ 
      messages: messages.slice(-25).map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }))
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
const startServer = async () => {
  try {
    await connection;
    console.log("Connected to DB");
    globalAssistant = await initializeAssistant();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server initialization failed:", error);
    process.exit(1);
  }
};

startServer();