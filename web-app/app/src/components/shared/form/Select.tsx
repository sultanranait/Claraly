import React from "react";
import {
  Box,
  Select as ChakraSelect,
  SelectProps as ChakraSelectProps,
  Text,
} from "@chakra-ui/react";
import { FieldError } from "react-hook-form";
import { Label } from "../Label";

interface SelectProps extends ChakraSelectProps {
  label?: string;
  error?: FieldError;
  options: Array<{ label: string; value: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, ...rest }, ref) => {
    return (
      <Box flex={1} w={"100%"}>
        {!!label && <Label>{label}</Label>}
        <ChakraSelect ref={ref} isInvalid={!!error} {...rest}>
          {options.map((option, i) => (
            <option key={i} value={option.value}>
              {option.label}
            </option>
          ))}
        </ChakraSelect>
        {!!error && <Text mt={2}>{error?.message?.toString()}</Text>}
      </Box>
    );
  }
);
