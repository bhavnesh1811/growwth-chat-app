// utils/streamHandler.js

const { MessageModel } = require('../model/message.model');
const { openai, getFinancialData } = require('./assisstant');

// Handle required actions during run
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

// Stream run status with enhanced error handling
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
          
          // Store assistant's response
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

module.exports = {
  handleRequiredAction,
  streamRunStatus
};