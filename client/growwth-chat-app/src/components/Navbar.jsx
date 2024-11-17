import {
  Box,
  Flex,
  Avatar,
  //   Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  //   useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
  Image,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const nav = useNavigate();
  //   const { isOpen, onOpen, onClose } = useDisclosure()

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    nav("/");
  };
  return (
    <>
      <Box px={6} bg={useColorModeValue("gray.100", "gray.900")}>
        <Flex h={24} alignItems={"center"} justifyContent={"space-between"}>
          <Box>
            <Image
              src="https://growwthpartners.com/wp-content/uploads/2024/05/growth-logo.png"
              alt="logo"
            />
          </Box>

          <Flex alignItems={"center"} bg={useColorModeValue("gray.100", "gray.900")}>
            <Stack direction={"row"} spacing={7}>
              {/* <Button onClick={toggleColorMode}>
                {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              </Button> */}

              <Menu>
                <MenuButton
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                  minW={0}
                >
                  <Avatar
                    size={"sm"}
                    src={"https://avatars.dicebear.com/api/male/username.svg"}
                  />
                </MenuButton>
                <MenuList alignItems={"center"}>
                  <br />
                  <Center>
                    <Avatar
                      size={"2xl"}
                      src={"https://avatars.dicebear.com/api/male/username.svg"}
                    />
                  </Center>
                  <br />
                  <Center>
                    <p>Username</p>
                  </Center>
                  <br />
                  <MenuDivider />

                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
