import { DownloadIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import { DocumentReference as FHIRDocumentReference } from "@medplum/fhirtypes";
import { Button } from "../../shared/Button";
import { isDownloading } from ".";

export const ActionsRowContent = ({
  doc,
  isDownloading,
  onDownloadFile,
}: {
  doc: FHIRDocumentReference;
  isDownloading: isDownloading;
  onDownloadFile: (
    docId: string,
    docFilename: string,
    conversionType?: "html" | "pdf"
  ) => Promise<void>;
}) => {
  const docId = doc.id;
  const docContentAttachment = doc.content?.[0]?.attachment;

  if (docId && docContentAttachment && docContentAttachment.title) {
    const contentType = docContentAttachment.contentType;
    const fileName = docContentAttachment.title;

    const isDocDownloading = isDownloading[docId]?.downloading ?? false;

    if (isXml(contentType)) {
      return (
        <Box>
          <Button
            isLoading={isDocDownloading && isDownloading[docId]?.type === "pdf"}
            onClick={() => onDownloadFile(docId, fileName, "pdf")}
            mr={5}
          >
            PDF
          </Button>
          <Button
            isLoading={isDocDownloading && isDownloading[docId]?.type === "html"}
            onClick={() => onDownloadFile(docId, fileName, "html")}
            mr={5}
          >
            HTML
          </Button>
          <Button
            isLoading={isDocDownloading && isDownloading[docId]?.type === "xml"}
            onClick={() => onDownloadFile(docId, fileName)}
          >
            XML
          </Button>
        </Box>
      );
    }

    return (
      <Button
        onClick={() => onDownloadFile(docId, fileName)}
        rightIcon={<DownloadIcon />}
        isLoading={isDocDownloading}
      >
        Save
      </Button>
    );
  }

  return null;
};

function isXml(mimeType: string | undefined): boolean {
  return mimeType ? mimeType.includes("xml") : false;
}
