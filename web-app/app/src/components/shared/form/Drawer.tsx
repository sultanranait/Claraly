import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import {
  UseFormReturn,
  DefaultValues,
  FieldValues,
  Resolver,
  SubmitHandler,
} from "react-hook-form";
import Form from "./Form";
import { Button } from "../Button";

interface DrawerFormProps<FormValues extends FieldValues> {
  children: (methods: UseFormReturn<FormValues>) => React.ReactNode;
  title: string;
  isOpen: boolean;
  isSubmitting: boolean;
  onSubmit: SubmitHandler<FormValues>;
  onClose: () => void;
  resolver: Resolver<FormValues>;
  defaultValues?: DefaultValues<FormValues>;
  btSaveId?: string;
  btCloseId?: string;
}

export default function DrawerForm<FormValues extends FieldValues>({
  children,
  title,
  isOpen,
  isSubmitting,
  onSubmit,
  onClose,
  resolver,
  defaultValues,
  btSaveId,
  btCloseId,
}: DrawerFormProps<FormValues>) {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={"lg"}>
      <DrawerOverlay />
      <DrawerContent motionProps={{ initial: "none", exit: "none" }}>
        <DrawerCloseButton />
        <DrawerHeader>{title}</DrawerHeader>
        <DrawerBody>
          <Form<FormValues> defaultValues={defaultValues} resolver={resolver} onSubmit={onSubmit}>
            {methods => children(methods)}
          </Form>
        </DrawerBody>
        <DrawerFooter borderTopWidth="1px">
          <Button
            form="hook-form"
            mr={3}
            isLoading={isSubmitting}
            type="submit"
            data-testid={btSaveId}
          >
            Save
          </Button>
          <Button
            _hover={{ bg: "#CCC" }}
            background={"#BBB"}
            type="button"
            variant="outline"
            mr={3}
            onClick={onClose}
            data-testid={btCloseId}
          >
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
