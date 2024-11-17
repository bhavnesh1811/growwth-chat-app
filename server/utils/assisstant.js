// utils/assistant.js
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Financial data (could be moved to a database or external service)
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

// Get financial data
async function getFinancialData(type, period) {
  if (!financialData[type]) {
    throw new Error(`Invalid data type: ${type}`);
  }
  
  if (period && !financialData[type][period]) {
    throw new Error(`Data not available for period: ${period}`);
  }
  
  return period ? financialData[type][period] : financialData[type];
}

// Initialize OpenAI assistant
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

module.exports = {
  openai,
  getFinancialData,
  initializeAssistant
};