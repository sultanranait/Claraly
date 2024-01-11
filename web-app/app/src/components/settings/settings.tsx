import {
  Heading,
  Box,
  Spinner,
  VStack,
  Stack,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../shared/api";

export default function Settings({}: {}) {
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const color = useColorModeValue("white", "gray.700");

  return (
    <Box>
      <Heading>Settings</Heading>
      {isLoadingToken ? (
        <Spinner size={"xl"}></Spinner>
      ) : (
        <VStack pt={4} align="stretch">
          <Stack
            spacing={4}
            w={"full"}
            maxW={"md"}
            bg={color}
            rounded={"xl"}
            boxShadow={"lg"}
            p={6}
            my={12}
          >
            <Button
              colorScheme="blue"
              bg="#748df0"
              color="white"
              _hover={{
                bg: "#879ced",
              }}
            >
              Do Something
            </Button>
          </Stack>
        </VStack>
      )}
    </Box>
  );
}
