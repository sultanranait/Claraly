import { useToast, UseToastOptions } from "@chakra-ui/react";

export type ToastOptions = Omit<UseToastOptions, "title"> &
  Required<Pick<UseToastOptions, "title">>;

export default function useMetriportToast() {
  const chakraToast = useToast();
  const duration = 2_000;
  const isClosable = true;
  return {
    info: (options: ToastOptions) =>
      chakraToast({
        status: "info",
        duration,
        isClosable,
        ...options,
      }),
    success: (options: ToastOptions) =>
      chakraToast({
        status: "success",
        duration,
        isClosable,
        ...options,
      }),
    error: (options: UseToastOptions = {}) =>
      chakraToast({
        status: "error",
        duration,
        isClosable,
        title: "Something went wrong, try again.",
        ...options,
      }),
  };
}
