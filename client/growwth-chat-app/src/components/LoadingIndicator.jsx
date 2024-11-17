import { HStack, Spinner, Text } from "@chakra-ui/react";

export const LoadingIndicator = ({ processingStatus }) => (
  <HStack spacing={3} p={2}>
    <Spinner size="sm" color="blue.500" speed="0.8s" />
    <Text fontSize="sm" color="gray.500">
      {processingStatus || "Financial advisor is analyzing..."}
    </Text>
  </HStack>
);