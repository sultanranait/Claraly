import { Box, Input as ChakraInput, InputProps as ChakraInputProps, Text } from "@chakra-ui/react";
import React from "react";
import { FieldError } from "react-hook-form";
import { Label } from "../Label";

const enterKeys = ["NumpadEnter", "Enter"];
interface InputProps extends ChakraInputProps {
  label?: string;
  error?: FieldError;
  disabled?: boolean;
  onEnterKeyPress?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, disabled, onEnterKeyPress, ...rest }, ref) => {
    return (
      <Box flex={1} w={"100%"}>
        {!!label && <Label>{label}</Label>}
        <ChakraInput
          disabled={disabled}
          ref={ref}
          isInvalid={!!error}
          {...rest}
          onKeyUp={key => {
            if (onEnterKeyPress && enterKeys.includes(key.code)) onEnterKeyPress();
          }}
        />
        {!!error && <Text mt={2}>{error.message?.toString()}</Text>}
      </Box>
    );
  }
);
