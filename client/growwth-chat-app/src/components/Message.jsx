import { memo } from "react";
import { Box, Text } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const MarkdownComponents = {
  code: memo(({ node, inline, className, children, ...props }) => {
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
  }),
};

export const Message = memo(
  ({ msg, userMsgBg, assistantMsgBg, formatTimestamp }) => {
    const isUser = msg.role === "user";

    return (
      <Box
        w="100%"
        display="flex"
        flexDirection="column"
        alignItems={isUser ? "flex-end" : "flex-start"}
      >
        <Box
          maxW={["85%", "75%", "70%"]}
          alignSelf={isUser ? "flex-end" : "flex-start"}
        >
          <Box
            bg={isUser ? userMsgBg : assistantMsgBg}
            color={isUser ? "white" : "inherit"}
            px={4}
            py={3}
            borderRadius="2xl"
            borderTopRightRadius={isUser ? "sm" : "2xl"}
            borderTopLeftRadius={isUser ? "2xl" : "sm"}
            boxShadow="sm"
            opacity={msg.isPartial ? 0.7 : 1}
          >
            {isUser ? (
              <Text fontSize={["sm", "md"]} whiteSpace="pre-wrap">
                {msg.content}
              </Text>
            ) : (
              <Box className="markdown-content" fontSize={["sm", "md"]}>
                <ReactMarkdown components={MarkdownComponents}>
                  {msg.content}
                </ReactMarkdown>
              </Box>
            )}
          </Box>
          <Text
            fontSize="xs"
            color="gray.500"
            mt={1}
            textAlign={isUser ? "right" : "left"}
          >
            {formatTimestamp(msg.timestamp)}
          </Text>
        </Box>
      </Box>
    );
  }
);