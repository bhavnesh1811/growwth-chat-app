// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");

const { UserRouter } = require("./routes/user.route");
const { MessageRouter } = require("./routes/message.route");
const { initializeAssistant } = require("./utils/assisstant");

const app = express();

// Middleware
app.use(express.json());
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "user-id", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
app.use(cors(corsOptions));

app.get((req, res) => {
  res.status(200).send({ message: "Api is working fine" });
});

// Routes
app.use("/api/auth", UserRouter);
app.use("/api/messages", MessageRouter);

// Start server
const PORT = process.env.PORT || 4000;
const startServer = async () => {
  try {
    await connection;
    console.log("Connected to DB");
    global.assistant = await initializeAssistant();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server initialization failed:", error);
    process.exit(1);
  }
};

startServer();
