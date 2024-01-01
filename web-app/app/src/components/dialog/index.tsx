import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Constants from "../shared/constants";

export interface DialogProps {
  show: boolean;
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  actionIsLoading?: boolean;
  onClose?: () => void;
}

const Dialog = ({
  show,
  title,
  message,
  actionText = "Ok",
  onAction,
  actionIsLoading = false,
  onClose: closed,
}: DialogProps) => {
  const { isOpen, onClose } = useDisclosure({ isOpen: show });
  const closeButtonRef = useRef(null);
  const [{ actualTitle, actualMsg }, setActual] = useState({
    actualTitle: title,
    actualMsg: message,
  });

  useEffect(() => {
    setActual({
      actualTitle: title ?? "Ooops...",
      actualMsg: message ?? Constants.errorDefaultMessage,
    });
  }, [title, message]);

  const action = () => {
    onAction && onAction();
  };

  const close = () => {
    onClose();
    closed && closed();
  };

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={closeButtonRef} onClose={close}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {actualTitle}
          </AlertDialogHeader>
          <AlertDialogBody>{actualMsg}</AlertDialogBody>
          <AlertDialogFooter>
            <Button isLoading={actionIsLoading} ref={closeButtonRef} onClick={action} ml={3}>
              {actionText}
            </Button>
            <Button ref={closeButtonRef} onClick={close} ml={3}>
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default Dialog;
