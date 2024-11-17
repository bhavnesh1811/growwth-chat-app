import { Alert, AlertIcon, AlertDescription } from "@chakra-ui/react";

export const ErrorAlert = ({ error }) => (
  <Alert
    status="error"
    borderRadius="md"
    variant="left-accent"
    animation="fadeIn 0.3s ease-in"
  >
    <AlertIcon />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
);