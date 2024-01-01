/* eslint-disable */
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
  Text,
  Box,
  Skeleton,
} from "@chakra-ui/react";
import { DocumentReference as FHIRDocumentReference } from "@medplum/fhirtypes";
import { PatientDTO } from "../models/patientDTO";
import { DocumentQuery } from "../models/document";
import { useCallback, useEffect, useState } from "react";
import { useInterval } from "../../hooks/use-interval";
import { capture } from "../../shared/capture";
import { Actions, Analytics, Features } from "../../shared/analytics";
import { Button } from "../../shared/Button";
import useMetriportToast from "../../shared/toast";
import { MetriportMedicalApiProps } from "../shared";
import { Filters } from "./Filters";
import { ProgressContainer } from "./ProgressBar";
import { Grid } from "./Grid";

const POLLING_INTERVAL = 3_000; //ms

export type PatientRecordsProps = MetriportMedicalApiProps &
  Pick<DrawerProps, "placement" | "size" | "onClose"> &
  Partial<Pick<DrawerProps, "isOpen">> & {
    patient: PatientDTO;
    facilityId: string;
  };

type QueryStatus = {
  isQuerying: boolean;
  queryProgress?: {
    total: number;
    completed: number;
  };
};

export type GetRecordsParams = {
  queryIfEmpty?: boolean;
  dateFrom?: string;
  dateTo?: string;
  content?: string;
};

export type isDownloading = Record<
  string,
  {
    type?: string;
    downloading: boolean;
  }
>;

export default function patientDocuments({
  api,
  patient,
  facilityId,
  ...props
}: PatientRecordsProps) {
  const toast = useMetriportToast();
  const [isLoadingRecords, setIsLoadingRecords] = useState<boolean>(true);
  const [docs, setDocs] = useState<FHIRDocumentReference[]>([]);
  const [isDownloading, setIsDownloading] = useState<isDownloading>({});
  const [queryStatus, setQueryStatus] = useState<QueryStatus>({
    isQuerying: false,
  });
  const [lastPatientId, setLastPatientId] = useState<string | undefined>(undefined);

  const updateQueryingStatus = useCallback((docQuery: DocumentQuery) => {
    const successful = docQuery.download?.successful ?? 0;
    const errors = docQuery.download?.errors ?? 0;

    return setQueryStatus({
      isQuerying: docQuery.download?.status === "processing",
      queryProgress: {
        total: docQuery.download?.total ? docQuery.download.total : 0,
        completed: successful + errors,
      },
    });
  }, []);

  async function sendDocQuery(): Promise<void> {
    const docQuery = await api.startDocumentQuery(patient.id, facilityId);
    updateQueryingStatus(docQuery);
  }

  useInterval(
    async () => {
      const { download } = await api.getDocumentQueryStatus(patient.id);
      updateQueryingStatus({ download });
      if (download?.status === "completed") {
        const documentList = await api.listDocuments(patient.id);

        setDocs(documentList.documents);
      }
    },
    queryStatus.isQuerying ? POLLING_INTERVAL : null
  );

  async function onGetRecords({
    queryIfEmpty,
    dateFrom,
    dateTo,
    content,
  }: GetRecordsParams): Promise<void> {
    setIsLoadingRecords(true);

    localStorage.setItem("doc_filters", JSON.stringify({ dateFrom, dateTo, content }));

    try {
      const dateFromValue = getFilterValue(dateFrom);
      const dateToValue = getFilterValue(dateTo);
      const contentValue = getFilterValue(content);

      const documentList = await api.listDocuments(patient.id, {
        dateFrom: dateFromValue,
        dateTo: dateToValue,
        content: contentValue,
      });

      setDocs(documentList.documents);
      if (queryIfEmpty && !documentList.documents.length) {
        // this prevents querying again after switching patients and filtering doesn't find any results
        const fullDocumentList = await api.listDocuments(patient.id);
        if (!fullDocumentList.documents.length) await sendDocQuery();
        return;
      }
      const { download } = await api.getDocumentQueryStatus(patient.id);
      updateQueryingStatus({ download });
    } catch (err) {
      capture.error(err, {
        extra: { patient: patient.id, facilityId, context: `patient.file.list` },
      });
      toast.error();
    } finally {
      setIsLoadingRecords(false);
    }
  }

  function getFilterValue(filterInput: string | undefined): string | undefined {
    if (!filterInput) return;
    const trimmedValue = filterInput.trim();
    return trimmedValue && trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  useEffect(() => {
    const queryIfEmpty = patient.id !== lastPatientId;
    if (queryIfEmpty) setLastPatientId(patient.id);

    const filters = localStorage.getItem("doc_filters");
    if (filters) {
      const { dateFrom, dateTo, content } = JSON.parse(filters);
      onGetRecords({ queryIfEmpty, dateFrom, dateTo, content });
    } else {
      onGetRecords({ queryIfEmpty });
    }
  }, [patient.id]);

  async function onDownloadFile(
    docId: string,
    docFilename: string,
    conversionType?: "html" | "pdf"
  ): Promise<void> {
    Analytics.emit(Actions.download, Features.document);
    setIsDownloading({
      ...isDownloading,
      [docId]: {
        downloading: true,
        type: conversionType ?? "xml",
      },
    });
    try {
      if (conversionType) {
        toast.info({
          title: "Hold tight... This might take up to 30 seconds.",
          duration: 5000,
        });
      }
      const resp = await api.getDocumentUrl(docFilename, conversionType);

      const a = document.createElement("a");
      a.href = resp.url;
      a.download = docFilename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      capture.error(err, { extra: { docId: docId, context: `patient.file.download` } });
      toast.error();
    }
    setIsDownloading({
      ...isDownloading,
      [docId]: {
        downloading: false,
      },
    });
  }

  return (
    <Drawer {...props} isOpen={props.isOpen !== undefined ? props.isOpen : true} size={"full"}>
      <DrawerOverlay />
      <DrawerContent
        // https://github.com/chakra-ui/chakra-ui/issues/7091
        motionProps={{ initial: "none", exit: "none" }}
      >
        <DrawerCloseButton />
        <DrawerHeader>Medical Documents</DrawerHeader>
        <Box
          flexDirection={"row"}
          alignItems={"flex-end"}
          justifyContent="space-between"
          display={"flex"}
          borderBottom={"1px solid #4e5766"}
          mx={6}
          pb={4}
        >
          <Box border={"1px solid #4e5766"} borderRadius={8} p={5}>
            <Text>Id: {patient.id}</Text>
            {patient.externalId && <Text>External Id: {patient.externalId}</Text>}
            <Text>
              Name: {patient.firstName} {patient.lastName}
            </Text>
            <Text m={0}>DOB: {patient.dob}</Text>
          </Box>
          <Filters onGetRecords={onGetRecords} />
        </Box>
        <DrawerBody pt={4} position={"relative"}>
          <Skeleton height={"full"} isLoaded={!isLoadingRecords}>
            <Grid docs={docs} isDownloading={isDownloading} onDownloadFile={onDownloadFile} />
          </Skeleton>
          <ProgressContainer queryStatus={queryStatus} />
        </DrawerBody>
        <DrawerFooter borderTopWidth="1px">
          <Button mr={3} isLoading={queryStatus.isQuerying} onClick={sendDocQuery}>
            Request Medical Documents
          </Button>
          <Button mr={3} onClick={props.onClose}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
