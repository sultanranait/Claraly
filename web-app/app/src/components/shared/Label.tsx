import { ChakraProps, Text, ThemingProps } from "@chakra-ui/react";
import { ReactNode } from "react";

export const Label = ({
  children,
  ...rest
}: {
  children?: ReactNode;
} & ChakraProps &
  ThemingProps<"Text">) => {
  return (
    <Text whiteSpace="nowrap" mt={5} mb={2} mr={3} {...rest}>
      {children}
    </Text>
  );
};
