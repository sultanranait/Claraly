import {
  HStack,
  Input as ChakraInput,
  InputProps as ChakraInputProps,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { FieldError } from "react-hook-form";

interface DateRangeProps extends ChakraInputProps {
  label?: string;
  error?: FieldError;
  disabled?: boolean;
  dateTo?: string;
  dateFrom?: string;
  onSetToDate: (date: string) => void;
  onSetFromDate: (date: string) => void;
}

export const DateRange = React.forwardRef<HTMLInputElement, DateRangeProps>(
  ({ onSetToDate, onSetFromDate, dateFrom, dateTo, error, disabled, ...rest }, ref) => {
    return (
      <VStack flex={1} w={"100%"} alignItems={"initial"}>
        <HStack flex={1} w={"100%"} spacing={2}>
          <VStack flex={1} alignItems={"flex-start"}>
            <Text m={0}>From:</Text>
            <ChakraInput
              value={dateFrom}
              onChange={e => onSetFromDate(e.target.value)}
              disabled={disabled}
              ref={ref}
              isInvalid={!!error}
              {...rest}
              id={`${rest.id}_from`}
              type={"date"}
            />
          </VStack>
          <VStack flex={1} alignItems={"flex-start"}>
            <Text m={0}>To:</Text>
            <ChakraInput
              value={dateTo}
              onChange={e => onSetToDate(e.target.value)}
              disabled={disabled}
              ref={ref}
              isInvalid={!!error}
              {...rest}
              id={`${rest.id}_to`}
              type={"date"}
            />
          </VStack>
        </HStack>
        {!!error && <Text mt={2}>{error.message?.toString()}</Text>}
      </VStack>
    );
  }
);
