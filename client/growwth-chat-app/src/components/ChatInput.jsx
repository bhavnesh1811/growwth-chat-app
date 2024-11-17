import { HStack, Input, Button } from "@chakra-ui/react";

export const ChatInput = ({
  userInput,
  setUserInput,
  handleSendMessage,
  isLoading,
  themeValues,
}) => (
  <HStack
    spacing={3}
    p={2}
    borderTop="1px"
    borderColor={themeValues.borderColor}
  >
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
      bg={themeValues.inputBgColor}
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
);
