import React from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  FormErrorMessage,
  Heading,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const AuthForm = ({
  title,
  onSubmit,
  isLoading,
  errors,
  formData,
  onChange,
  isLogin,
}) => {
  return (
    <Box
      maxW="md"
      mx="auto"
      mt={8}
      p={6}
      borderRadius="lg"
      boxShadow="xl"
      bg="white"
    >
      <VStack spacing={6}>
        <Heading size="lg">{title}</Heading>
        <form onSubmit={onSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isInvalid={errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Enter your email"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                placeholder="Enter your password"
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={isLoading}
              loadingText="Submitting"
            >
              {title}
            </Button>
          </VStack>
        </form>

        <Text>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link
            to={isLogin ? "/signup" : "/login"}
            style={{ color: 'blue', textDecoration: 'underline' }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default AuthForm;