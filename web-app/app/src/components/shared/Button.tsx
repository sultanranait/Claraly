import { Button as ChakraButton, ButtonProps, ChakraProps } from "@chakra-ui/react";
import { MouseEventHandler, ReactNode } from "react";

export const Button = ({
  type,
  onClick,
  isLoading,
  loadingText,
  disabled,
  children,
  ...rest
}: {
  type?: "button" | "reset" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  children?: ReactNode;
} & ChakraProps &
  ButtonProps) => {
  return (
    <ChakraButton
      {...(rest.colorScheme
        ? undefined
        : {
            bg: "#748df0",
            color: "white",
            _hover: {
              bg: "#879ced",
            },
          })}
      onClick={onClick}
      isLoading={isLoading ?? false}
      loadingText={loadingText}
      isDisabled={disabled ?? false}
      type={type}
      {...rest}
    >
      {children}
    </ChakraButton>
  );
};
