import { useColorModeValue } from "@chakra-ui/react";

export const useChatTheme = () => ({
  bgColor: useColorModeValue("gray.50", "gray.900"),
  chatBgColor: useColorModeValue("white", "gray.800"),
  userMsgBg: useColorModeValue("blue.500", "blue.400"),
  assistantMsgBg: useColorModeValue("gray.100", "gray.700"),
  inputBgColor: useColorModeValue("white", "gray.700"),
  borderColor: useColorModeValue("gray.200", "gray.600"),
  scrollbarColor: useColorModeValue("gray.300", "gray.600"),
});