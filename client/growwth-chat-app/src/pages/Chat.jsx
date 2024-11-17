import React from 'react';
import { Flex } from '@chakra-ui/react';
import ChatBox from '../components/ChatBox';
import Navbar from '../components/Navbar';

const Chat = () => {
  return (
    <Flex flexDirection={"column"} h="100vh" w="100vw" overflowX={"hidden"}>
      <Navbar />
      <ChatBox />
    </Flex>
  );
};

export default Chat;