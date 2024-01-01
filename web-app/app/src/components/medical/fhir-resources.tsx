import {
  Card,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
  Icon,
  Text,
  Box,
  Skeleton,
  useColorModeValue,
} from "@chakra-ui/react";
import { Bundle, Resource } from "@medplum/fhirtypes";
import { IconType } from "react-icons";
import { useEffect, useState } from "react";
import { MdErrorOutline } from "react-icons/md";
import { FaFire } from "react-icons/fa";
import { ConsolidatedCountResponse } from "./models/fhir";
import { MetriportMedicalApiProps } from "./shared";
import { FHIRResource } from "../shared/FhirResource";

export type PatientRecordsProps = MetriportMedicalApiProps &
  Pick<DrawerProps, "placement" | "size" | "onClose"> &
  Partial<Pick<DrawerProps, "isOpen">> & {
    patientId: string;
  };

export const FHIRResources = ({ api, patientId, ...props }: PatientRecordsProps) => {
  const [counts, setCounts] = useState<ConsolidatedCountResponse | null>(null);
  const [resources, setResources] = useState<Bundle<Resource> | null>(null);
  const [isLoadingResources, setIsLoadingResources] = useState<boolean>(false);

  const bgColor = useColorModeValue("gray.200", "#171923");

  const getResourcesCount = async (): Promise<void> => {
    const consolidatedCounts = await api.countPatientConsolidated(patientId);

    setCounts(consolidatedCounts);
  };

  useEffect(() => {
    getResourcesCount();
  }, []);

  const getResources = async (key: string): Promise<void> => {
    setIsLoadingResources(true);

    const consolidatedResources = await api.getPatientConsolidated(patientId, [key]);

    setResources(consolidatedResources);

    setIsLoadingResources(false);
  };

  return (
    <Drawer {...props} isOpen={props.isOpen !== undefined ? props.isOpen : true} size={"full"}>
      <DrawerOverlay />
      <DrawerContent
        // https://github.com/chakra-ui/chakra-ui/issues/7091
        motionProps={{ initial: "none", exit: "none" }}
      >
        <DrawerCloseButton />
        <DrawerHeader>FHIR Resources</DrawerHeader>
        <DrawerBody p={0} overflowY={"hidden"}>
          <Box pt={4} height={"100%"} display={"flex"} margin={0} padding={0}>
            <ResourcesList counts={counts} onGetResources={getResources} bgColor={bgColor} />
            <ResourcesContainer
              totalResources={counts?.total}
              resources={resources}
              isLoading={isLoadingResources}
              bgColor={bgColor}
            />
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

type ResourceListItemsProps = {
  counts: ConsolidatedCountResponse | null;
  onGetResources: (key: string) => void;
};

const ResourcesList = ({
  counts,
  onGetResources,
  bgColor,
}: ResourceListItemsProps & { bgColor: string }) => {
  return (
    <Box
      minW={250}
      bgColor={bgColor}
      ml={4}
      mb={4}
      mr={6}
      px={2}
      pt={8}
      borderRadius={10}
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      overflowY={"scroll"}
    >
      <ResourceListItems counts={counts} onGetResources={onGetResources} />
    </Box>
  );
};

const ResourceListItems = ({ counts, onGetResources }: ResourceListItemsProps) => {
  if (counts) {
    return (
      <>
        {Object.keys(counts.resources).map((key, i) => (
          <Text
            className="ph-no-capture"
            userSelect={"none"}
            onClick={() => onGetResources(key)}
            cursor={"pointer"}
            px={8}
            py={4}
            _hover={{ backgroundColor: "#748df0", borderRadius: "10px" }}
            mb={4}
            key={i}
          >
            {`${key}: ${counts.resources[key]}`}
          </Text>
        ))}
      </>
    );
  }

  return (
    <>
      {Array.from(Array(10).keys()).map(i => (
        <Skeleton key={i} height={"40px"} width={"100%"} mb={4} borderRadius={"10px"} />
      ))}
    </>
  );
};

const ResourcesContainer = ({
  totalResources,
  resources,
  isLoading,
  bgColor,
}: {
  totalResources: number | undefined;
  resources: Bundle<Resource> | null;
  isLoading: boolean;
  bgColor: string;
}) => {
  if (totalResources === undefined) {
    return <></>;
  }

  if (totalResources === 0) {
    return (
      <DescriptiveCard
        title={"No resources found"}
        body={
          "This patient has no resources. This may be because you haven't completed a document query on the patient's documents tab, or because the request is still processing - try this and check back here later."
        }
        icon={MdErrorOutline}
        bgColor={bgColor}
      />
    );
  }

  if (totalResources > 0 && resources === null) {
    return (
      <DescriptiveCard
        title={"Select a resource type"}
        body={
          "Select an available resource type from the list on the left to view all available resources."
        }
        icon={FaFire}
        bgColor={bgColor}
      />
    );
  }

  return <Resources resources={resources} isLoading={isLoading} />;
};

const Resources = ({
  resources,
  isLoading,
}: {
  resources: Bundle<Resource> | null;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <Skeleton flex={1} mr={4} mb={4} borderRadius={"10px"} />;
  }

  return (
    <Box pr={6} pb={5} overflowY={"scroll"}>
      {resources && (
        <FHIRResource className="ph-no-capture" fhirResource={resources} withCarinBBProfile />
      )}
    </Box>
  );
};

const DescriptiveCard = ({
  title,
  body,
  icon,
  bgColor,
}: {
  title: string;
  body: string;
  icon: IconType;
  bgColor: string;
}) => {
  return (
    <Card
      bgColor={bgColor}
      height={"fit-content"}
      borderRadius={10}
      p={6}
      display={"flex"}
      alignItems={"center"}
      flexDirection={"column"}
      width={"500px"}
    >
      <Icon mb={2} as={icon} w={100} h={100} />
      <Text textAlign={"center"} fontSize={"2xl"} fontWeight="semibold">
        {title}
      </Text>
      <Text mb={0} textAlign={"center"}>
        {body}
      </Text>
    </Card>
  );
};
