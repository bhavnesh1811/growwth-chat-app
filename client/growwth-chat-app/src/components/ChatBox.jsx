import { useState, useEffect, useCallback, useRef } from "react";
import { Box, VStack, useToast } from "@chakra-ui/react";
import { ChatInput } from "./ChatInput";
import { LoadingIndicator } from "./LoadingIndicator";
import { ErrorAlert } from "./ErrorAlert";
import { createAxiosInstance } from "../utils/api";
import { formatTimestamp } from "../utils/formatter";
import { useChatTheme } from "../hooks/useChatTheme";
import { Message } from "./Message";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState("");
  const messagesEndRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
  const toast = useToast();
  const themeValues = useChatTheme();

  const getAuthHeaders = useCallback(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(userId && { "user-id": userId }),
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }, []);

  const axiosInstance = useCallback(
    () => createAxiosInstance(API_URL, getAuthHeaders),
    [API_URL, getAuthHeaders]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Memoized fetch messages function
  const fetchMessages = useCallback(async () => {
    try {
      setError(null);
      const { data } = await axiosInstance().get("/api/messages");
      setMessages(data.messages || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load previous messages";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error fetching messages:", err);
    }
  }, [axiosInstance, toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Memoized stream message processor
  const processStreamMessage = useCallback((data) => {
    try {
      const parsedData = JSON.parse(data);

      switch (parsedData.type) {
        case "message":
          setMessages((prev) => {
            const filteredMessages = prev.filter(
              (m) => !(m.role === "assistant" && m.isPartial)
            );
            return [
              ...filteredMessages,
              {
                role: "assistant",
                content: parsedData.content,
                isPartial: false,
                timestamp: Date.now(),
              },
            ];
          });
          setProcessingStatus("");
          break;

        case "status":
          setProcessingStatus(parsedData.content);
          break;

        case "error":
          throw new Error(parsedData.content);

        default:
          console.warn("Unknown message type:", parsedData.type);
      }
    } catch (err) {
      console.error("Error processing stream message:", err);
      throw err;
    }
  }, []);

  // Memoized send message handler
  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;

    const newMessage = {
      role: "user",
      content: userInput.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setUserInput("");
    setIsLoading(true);
    setError(null);
    setProcessingStatus("");

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: userInput.trim() }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (buffer.trim()) {
            buffer.split("\n").forEach((line) => {
              if (line.startsWith("data: ")) {
                processStreamMessage(line.slice(6));
              }
            });
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        buffer = lines
          .filter((line) => {
            if (line.startsWith("data: ")) {
              try {
                processStreamMessage(line.slice(6));
                return false;
              } catch (err) {
                console.error("Error processing message:", err);
                return false;
              }
            }
            return true;
          })
          .join("\n");
      }
    } catch (err) {
      const errorMessage =
        err.message || "Failed to send message. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error in chat:", err);
      setMessages((prev) => prev.filter((m) => !m.isPartial));
    } finally {
      setIsLoading(false);
    }
  }, [
    userInput,
    API_URL,
    isLoading,
    processStreamMessage,
    getAuthHeaders,
    toast,
  ]);

  return (
    <Box
      w="100vw"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={themeValues.bgColor}
      p={[2, 4, 6]}
    >
      <Box
        maxW={["100%", "100%", "800px"]}
        h={["100%", "100%", "600px"]}
        borderRadius={["0", "lg", "xl"]}
        boxShadow={["none", "lg", "xl"]}
        overflow="hidden"
        w="full"
        bg={themeValues.chatBgColor}
        border="1px"
        borderColor={themeValues.borderColor}
      >
        <VStack align="stretch" h="100%" spacing={4} p={[3, 4]}>
          {error && <ErrorAlert error={error} />}

          <VStack
            align="stretch"
            flex="1"
            overflowY="auto"
            p={2}
            spacing={4}
            borderRadius="md"
            sx={{
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-track": {
                width: "6px",
                backgroundColor: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: themeValues.scrollbarColor,
                borderRadius: "24px",
              },
              scrollbarWidth: "thin",
              scrollbarColor: `${themeValues.scrollbarColor} transparent`,
            }}
          >
            {messages.map((msg, idx) => (
              <Message
                key={`${idx}-${msg.role}-${msg.timestamp}`}
                msg={msg}
                userMsgBg={themeValues.userMsgBg}
                assistantMsgBg={themeValues.assistantMsgBg}
                formatTimestamp={formatTimestamp}
              />
            ))}

            {isLoading && <LoadingIndicator processingStatus={processingStatus} />}
            <div ref={messagesEndRef} />
          </VStack>

          <ChatInput
            userInput={userInput}
            setUserInput={setUserInput}
            handleSendMessage={handleSendMessage}
            isLoading={isLoading}
            themeValues={themeValues}
          />
        </VStack>
      </Box>
    </Box>
  );
}

export default ChatBox;
