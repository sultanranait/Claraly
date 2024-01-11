import { AddIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import { MetriportMedicalApi } from "../client/metriport";
import { PatientDTO } from "../models/patientDTO";
import { useContext, useState } from "react";
import { BsPeopleFill } from "react-icons/bs";
import { FaFileMedical, FaFire } from "react-icons/fa";
import { MedicalAppStateContext } from "../../contexts/medical";
import { Actions, Analytics, Features } from "../../shared/analytics";
import { Button as SharedButton } from "../../shared/Button";
import PatientDocuments from "../documents";
import { FHIRResources } from "../fhir-resources";
import PatientForm from "./form";

export default function Patients({ api }: { api: MetriportMedicalApi }) {
  const bgColor = useColorModeValue("white", "gray.700");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [patientForDocuments, setPatientForDocuments] = useState<PatientDTO | undefined>(undefined);
  const [patientIdForFHIRResources, setPatientIdForFHIRResources] = useState<string | undefined>(
    undefined
  );
  const [patientToEdit, setPatientToEdit] = useState<string | undefined>(undefined);
  const { medicalState } = useContext(MedicalAppStateContext);

  function onEdit(patient: PatientDTO): void {
    Analytics.emit(Actions.open, Features.form, { type: Features.patient });
    setPatientToEdit(patient.id);
    onOpen();
  }

  function onAdd(): void {
    Analytics.emit(Actions.open, Features.form, { type: Features.patient });
    setPatientToEdit(undefined);
    onOpen();
  }

  function onOpenDocuments(patient: PatientDTO): void {
    Analytics.emit(Actions.open, Features.form, { type: Features.document });
    setPatientForDocuments(patient);
  }

  function onCloseDocuments(): void {
    Analytics.emit(Actions.close, Features.form, { type: Features.document });
    setPatientForDocuments(undefined);
  }

  function onOpenFHIRResources(patient: PatientDTO): void {
    Analytics.emit(Actions.open, Features.form, { type: Features.fhir });
    setPatientIdForFHIRResources(patient.id);
  }

  function onCloseFHIRResources(): void {
    Analytics.emit(Actions.close, Features.form, { type: Features.fhir });
    setPatientIdForFHIRResources(undefined);
  }

  const closeForm = () => {
    Analytics.emit(Actions.close, Features.form, { type: Features.patient });
    onClose();
  };

  const patients = medicalState.store?.patients;

  const doPatientsHaveExternalIds = Object.keys(patients || {}).some(
    id => patients?.[id].externalId
  );

  return (
    <Box maxW={"max"} bg={bgColor} rounded={"xl"} boxShadow={"lg"} p={6} my={12}>
      <Flex minWidth={"max-content"} alignItems="center" gap={"2"}>
        <HStack>
          <Icon as={BsPeopleFill} />
          <Heading as="h4" size="md">
            Patients at {medicalState?.selectedFacility?.name}
          </Heading>
        </HStack>
        <Spacer />
        <SharedButton onClick={onAdd} leftIcon={<AddIcon />}>
          Add
        </SharedButton>
      </Flex>
      <Box>
        <TableContainer className="add-scroll">
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th>ID</Th>
                {doPatientsHaveExternalIds && <Th>External ID</Th>}
                <Th>First</Th>
                <Th>Last</Th>
                <Th>DOB</Th>
                <Box position={"sticky"} width="100" right={0} background={bgColor}>
                  <Th borderColor={bgColor}></Th>
                  <Th borderColor={bgColor}></Th>
                </Box>
              </Tr>
            </Thead>
            <Tbody>
              {patients && medicalState?.selectedFacility?.id ? (
                Object.keys(patients).map((id, i) => {
                  const patient = patients[id];
                  if (patient.facilityIds.includes(medicalState?.selectedFacility?.id ?? "")) {
                    return (
                      <PatientRow
                        key={i}
                        bgColor={bgColor}
                        patient={patient}
                        onEdit={onEdit}
                        onOpenDocuments={onOpenDocuments}
                        onOpenFHIRResources={onOpenFHIRResources}
                        showExternalId={doPatientsHaveExternalIds}
                      />
                    );
                  }
                })
              ) : (
                <></>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      <PatientForm patientId={patientToEdit} api={api} isOpen={isOpen} onClose={closeForm} />

      {/* Document Management */}
      {!!patientForDocuments && (
        <PatientDocuments
          api={api}
          patient={patientForDocuments}
          facilityId={medicalState?.selectedFacility?.id ?? ""}
          placement="right"
          onClose={onCloseDocuments}
          size={"xl"}
        />
      )}

      {/* FHIR Data Explorer */}
      {!!patientIdForFHIRResources && (
        <FHIRResources
          api={api}
          patientId={patientIdForFHIRResources}
          placement="right"
          onClose={onCloseFHIRResources}
          size={"xl"}
        />
      )}
    </Box>
  );
}

const PatientRow = ({
  patient,
  bgColor,
  onEdit,
  onOpenDocuments,
  onOpenFHIRResources,
  showExternalId,
}: {
  patient: PatientDTO;
  bgColor: string;
  onEdit: (patient: PatientDTO) => void;
  onOpenDocuments: (patient: PatientDTO) => void;
  onOpenFHIRResources: (patient: PatientDTO) => void;
  showExternalId?: boolean;
}) => {
  return (
    <Tr>
      <Td className="ph-no-capture">{patient.id}</Td>
      {showExternalId && <Td className="ph-no-capture">{patient.externalId}</Td>}
      <Td className="ph-no-capture">{patient.firstName}</Td>
      <Td className="ph-no-capture">{patient.lastName}</Td>
      <Td className="ph-no-capture">{patient.dob}</Td>
      <Box
        position={"sticky"}
        width="100"
        right={0}
        borderLeft={{ base: "1px solid", "2xl": "none" }}
      >
        <Td background={bgColor} pr={0}>
          <Tooltip label="Edit Patient">
            <Button
              mr={5}
              color={"white"}
              bg={"#748df0"}
              _hover={{ bg: "#879ced" }}
              onClick={() => onEdit(patient)}
            >
              <EditIcon m={0} />
            </Button>
          </Tooltip>
          <Tooltip label="View Documents">
            <Button
              mr={5}
              color={"white"}
              bg={"#748df0"}
              _hover={{ bg: "#879ced" }}
              onClick={() => onOpenDocuments(patient)}
            >
              <FaFileMedical />
            </Button>
          </Tooltip>
          <Tooltip label="View FHIR Data">
            <Button
              color={"white"}
              bg={"#748df0"}
              _hover={{ bg: "#879ced" }}
              onClick={() => onOpenFHIRResources(patient)}
            >
              <FaFire />
            </Button>
          </Tooltip>
        </Td>
      </Box>
    </Tr>
  );
};
