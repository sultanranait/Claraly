import { AddIcon, EditIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom"
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
import { Facility } from "../models/facility";
import { useContext, useState } from "react";
import { BsPeopleFill } from "react-icons/bs";
import { FaClinicMedical } from "react-icons/fa";
import { capture } from "../../shared/capture";
import { MedicalAppStateContext } from "../../contexts/medical";
import { MedicalAppStateActionType, PatientsMap } from "../../contexts/medical/reducer";
import { Actions, Analytics, Features } from "../../shared/analytics";
import { Button as SharedButton } from "../../shared/Button";
import useMetriportToast from "../../shared/toast";
import FacilityForm from "./form";

export default function Facilities({ api }: { api: MetriportMedicalApi }) {
  const navigate = useNavigate()
  const bgColor = useColorModeValue("white", "gray.700");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [gettingPatients, setGettingPatients] = useState<boolean>(false);
  const [facilityToEdit, setFacilityToEdit] = useState<string | undefined>(undefined);
  const { medicalState, medicalDispatch } = useContext(MedicalAppStateContext);
  const toast = useMetriportToast();

  async function onGetPatients(facility: Facility): Promise<void> {
    Analytics.emit(Actions.get, Features.patient);
    try {
      setGettingPatients(true);
      const patients = await api.listPatients(facility.id);
      const patientsMap: PatientsMap = {};
      for (const patient of patients) {
        patientsMap[patient.id] = patient;
      }
      medicalDispatch({
        type: MedicalAppStateActionType.update,
        newState: {
          store: { ...medicalState.store, patients: patientsMap },
          selectedFacility: facility,
        },
      });
      navigate("/patients")
    } catch (err) {
      capture.error(err, {
        extra: { facilityId: facility.id, context: `facility.getPatients` },
      });
      toast.error();
    }
    setGettingPatients(false);
  }

  function onAddFacility(): void {
    Analytics.emit(Actions.open, Features.form, { type: Features.facility });
    onOpen();
  }

  function onEditFacility(facilityId: string): void {
    Analytics.emit(Actions.open, Features.form, { type: Features.facility });
    setFacilityToEdit(facilityId);
    onOpen();
  }

  const closeForm = () => {
    Analytics.emit(Actions.close, Features.form, { type: Features.facility });
    setFacilityToEdit(undefined);
    onClose();
  };

  return (
    <Box maxW={"max"} bg={bgColor} rounded={"xl"} boxShadow={"lg"} p={6} my={12} overflowY="scroll">
      <Flex minWidth={"max-content"} alignItems="center" gap={"2"}>
        <HStack>
          <Icon as={FaClinicMedical} />
          <Heading as="h4" size="md">
            Facilities
          </Heading>
        </HStack>
        <Spacer />
        <SharedButton onClick={onAddFacility} leftIcon={<AddIcon />}>
          Add
        </SharedButton>
      </Flex>
      <Box>
        <TableContainer className="add-scroll">
          <Table variant="striped">
            <Thead>
              <Tr background={bgColor}>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>State</Th>
                <Box position={"sticky"} width="100" right={0} background={bgColor}>
                  <Th borderColor={bgColor}></Th>
                  <Th borderColor={bgColor}></Th>
                </Box>
              </Tr>
            </Thead>
            <Tbody>
              {medicalState.store?.facilities ? (
                Object.keys(medicalState.store?.facilities).map((id, i) => {
                  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                  const facility = medicalState.store?.facilities![id];
                  if (!facility) return;
                  return (
                    <Tr key={i}>
                      <Td>{facility.id}</Td>
                      <Td>{facility.name}</Td>
                      <Td>{facility.address.state}</Td>
                      <Box
                        position={"sticky"}
                        width="100"
                        right={0}
                        borderLeft={{ base: "1px solid", xl: "none" }}
                      >
                        <Td pr={0} background={bgColor}>
                          <Tooltip label="Edit" aria-label="Edit">
                            <Button
                              color={"white"}
                              mr={5}
                              bg={"#748df0"}
                              _hover={{ bg: "#879ced" }}
                              onClick={() => onEditFacility(facility.id)}
                            >
                              <EditIcon />
                            </Button>
                          </Tooltip>
                          <Tooltip label="Patients" aria-label="Patients">
                            <Button
                              color={"white"}
                              bg={"#748df0"}
                              _hover={{ bg: "#879ced" }}
                              isLoading={gettingPatients}
                              onClick={() => onGetPatients(facility)}
                            >
                              <BsPeopleFill />{" "}
                            </Button>
                          </Tooltip>
                        </Td>
                      </Box>
                    </Tr>
                  );
                })
              ) : (
                <></>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
      <FacilityForm facilityId={facilityToEdit} isOpen={isOpen} api={api} onClose={closeForm} />
    </Box>
  );
}
