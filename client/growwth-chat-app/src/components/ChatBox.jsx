import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  Box,
  Input,
  Button,
  VStack,
  Text,
  Spinner,
  HStack,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState("");
  const messagesEndRef = useRef(null);
  const userId = "default-user";
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
  const toast = useToast();

  // Theme values remain the same
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const chatBgColor = useColorModeValue("white", "gray.800");
  const userMsgBg = useColorModeValue("blue.500", "blue.400");
  const assistantMsgBg = useColorModeValue("gray.100", "gray.700");
  const inputBgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Configure axios instance
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      "user-id": userId
    }
  });

  // Scroll and fetch messages effects remain the same
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  console.log(messages)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setError(null);
        const { data } = await axiosInstance.get('/api/messages');
        setMessages(data.messages || []);
      } catch (err) {
        const errorMessage = "Failed to load previous messages";
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
    };

    fetchMessages();
  }, [toast]);

  // Format timestamp helper function remains the same
  const formatTimestamp = (timestamp) => {
    try {
      // Convert timestamp to milliseconds if it's in seconds
      const adjustedTimestamp =
        String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
  
      const date = new Date(adjustedTimestamp);
  
      // Validate date
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
  
      const istOptions = {
        timeZone: "Asia/Kolkata",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit", // Added seconds for more precision
      };
  
      return new Intl.DateTimeFormat("en-IN", istOptions).format(date);
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid time";
    }
  };
  

  // Process message function remains the same
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

  // Updated handle send message function with proper streaming
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
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
        body: JSON.stringify({ message: userInput.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (buffer.trim()) {
            const lines = buffer.split('\n');
            lines.forEach(line => {
              if (line.startsWith('data: ')) {
                processStreamMessage(line.slice(6));
              }
            });
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        const remainingLines = lines.filter(line => {
          if (line.startsWith('data: ')) {
            try {
              processStreamMessage(line.slice(6));
              return false;
            } catch (err) {
              console.error('Error processing message:', err);
              return false;
            }
          }
          return true;
        });

        buffer = remainingLines.join('\n');
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to send message. Please try again.";
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
  }, [userInput, API_URL, userId, isLoading, processStreamMessage, toast]);

  // Markdown components remain the same
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={atomDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  // JSX remains the same
  return (
    <Box
      w="100vw"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
      p={[2, 4, 6]}
    >
      {/* Rest of the JSX remains exactly the same */}
      <Box
        maxW={["100%", "100%", "800px"]}
        h={["100%", "100%", "600px"]}
        borderRadius={["0", "lg", "xl"]}
        boxShadow={["none", "lg", "xl"]}
        overflow="hidden"
        w="full"
        bg={chatBgColor}
        border="1px"
        borderColor={borderColor}
      >
        <VStack align="stretch" h="100%" spacing={4} p={[3, 4]}>
          {error && (
            <Alert
              status="error"
              borderRadius="md"
              variant="left-accent"
              animation="fadeIn 0.3s ease-in"
            >
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <VStack
            align="stretch"
            flex="1"
            overflowY="auto"
            p={2}
            spacing={4}
            borderRadius="md"
            // bg={chatBgBox}
            sx={{
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                width: "6px",
                backgroundColor: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: useColorModeValue("gray.300", "gray.600"),
                borderRadius: "24px",
              },
              scrollbarWidth: "thin",
              scrollbarColor: `${useColorModeValue(
                "gray.300",
                "gray.600"
              )} transparent`,
            }}
          >
            {messages.map((msg, idx) => (
              <Box
                key={`${idx}-${msg.role}-${msg.timestamp}`}
                w="100%"
                display="flex"
                flexDirection="column"
                alignItems={msg.role === "user" ? "flex-end" : "flex-start"}
              >
                <Box
                  maxW={["85%", "75%", "70%"]}
                  alignSelf={msg.role === "user" ? "flex-end" : "flex-start"}
                >
                  <Box
                    bg={msg.role === "user" ? userMsgBg : assistantMsgBg}
                    color={msg.role === "user" ? "white" : "inherit"}
                    px={4}
                    py={3}
                    borderRadius="2xl"
                    borderTopRightRadius={msg.role === "user" ? "sm" : "2xl"}
                    borderTopLeftRadius={msg.role === "user" ? "2xl" : "sm"}
                    boxShadow="sm"
                    opacity={msg.isPartial ? 0.7 : 1}
                  >
                    {msg.role === "user" ? (
                      <Text fontSize={["sm", "md"]} whiteSpace="pre-wrap">
                        {msg.content}
                      </Text>
                    ) : (
                      <Box className="markdown-content" fontSize={["sm", "md"]}>
                        <ReactMarkdown
                          components={MarkdownComponents}
                          children={msg.content}
                        />
                      </Box>
                    )}
                  </Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mt={1}
                    textAlign={msg.role === "user" ? "right" : "left"}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </Text>
                </Box>
              </Box>
            ))}
            {isLoading && (
              <HStack spacing={3} p={2}>
                <Spinner size="sm" color="blue.500" speed="0.8s" />
                <Text fontSize="sm" color="gray.500">
                  {processingStatus || "Financial advisor is analyzing..."}
                </Text>
              </HStack>
            )}
            <div ref={messagesEndRef} />
          </VStack>

          <HStack spacing={3} p={2} borderTop="1px" borderColor={borderColor}>
            <Input
              placeholder="Ask about your financial data..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              bg={inputBgColor}
              size={["md", "lg"]}
              fontSize={["sm", "md"]}
              borderRadius="lg"
              _hover={{ borderColor: "blue.400" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
              _disabled={{
                opacity: 0.7,
                cursor: "not-allowed",
              }}
            />
            <Button
              colorScheme="blue"
              onClick={handleSendMessage}
              isDisabled={isLoading || !userInput.trim()}
              isLoading={isLoading}
              loadingText="Sending"
              minW={["70px", "80px", "100px"]}
              size={["md", "lg"]}
              borderRadius="lg"
              fontWeight="600"
              _hover={{
                transform: "translateY(-1px)",
                boxShadow: "md",
              }}
              _active={{
                transform: "translateY(0)",
                boxShadow: "sm",
              }}
            >
              Send
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}

export default ChatBox;