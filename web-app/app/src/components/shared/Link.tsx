import { Link as ChakraLink } from "@chakra-ui/react";
import { ReactNode } from "react";

export const Link = ({
  href,
  isExternal,
  children,
}: {
  href?: string;
  isExternal?: boolean;
  children?: ReactNode;
}) => {
  return (
    <ChakraLink color="teal.500" href={href} isExternal={isExternal}>
      {children}
    </ChakraLink>
  );
};
