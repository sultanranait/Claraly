import { AddIcon, EditIcon } from "@chakra-ui/icons";
import {
  Input,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Spacer,
  Stack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useContext } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { BsClipboard } from "react-icons/bs";
import { FaBuilding } from "react-icons/fa";
import { MedicalAppStateContext } from "../../contexts/medical";
import { Actions, Analytics, Features } from "../../shared/analytics";
import { Button } from "../../shared/Button";
import useMetriportToast from "../../shared/toast";
import { MetriportMedicalApiProps } from "../shared";
import OrganizationForm from "./form";
import { Label } from "../../shared/Label";

export default function OrganizationManager({ api }: MetriportMedicalApiProps) {
  const bgColor = useColorModeValue("white", "gray.700");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { medicalState } = useContext(MedicalAppStateContext);
  const toast = useMetriportToast();
  const org = medicalState.store?.organization;
  const hasOrg = org != null;

  const copied = () => {
    toast.success({ title: "Copied Organization ID to Clipboard" });
  };

  const openForm = () => {
    Analytics.emit(Actions.open, Features.form, { type: Features.organization });
    onOpen();
  };

  const closeForm = () => {
    Analytics.emit(Actions.close, Features.form, { type: Features.organization });
    onClose();
  };

  return (
    <Stack spacing={4} w={"max-content"} bg={bgColor} rounded={"xl"} boxShadow={"lg"} p={6} my={12}>
      <Flex minWidth={"max-content"} alignItems="center" gap={"2"}>
        <HStack>
          <Icon as={FaBuilding} />
          <Heading as="h4" size="md">
            {org ? org.name : "Organization"}
          </Heading>
        </HStack>
        <Spacer />
        {hasOrg ? (
          <Button onClick={openForm} leftIcon={<EditIcon />} data-testid="org-edit">
            Edit
          </Button>
        ) : (
          <Button onClick={openForm} leftIcon={<AddIcon />}>
            Create
          </Button>
        )}
      </Flex>
      {org && org.id ? (
        <Flex alignItems="left" direction={"row"} mt={3}>
          <Label mt={2}>Your Organization ID:</Label>
          <Input
            type={"text"}
            defaultValue={org.id}
            textOverflow="ellipsis"
            minWidth={"300px"}
            readOnly
          />
          <CopyToClipboard text={org.id} onCopy={copied}>
            <IconButton aria-label="Copy to clipboard" icon={<BsClipboard />} />
          </CopyToClipboard>
        </Flex>
      ) : null}
      <OrganizationForm api={api} isOpen={isOpen} onClose={closeForm} />
    </Stack>
  );
}
