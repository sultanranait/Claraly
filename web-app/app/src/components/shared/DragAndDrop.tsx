import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import { useDropzone, DropzoneOptions } from "react-dropzone";

export type DragAndDropProps = {
  onDrop: DropzoneOptions["onDrop"];
  fileName?: string;
};

export default function DragAndDrop(props: DragAndDropProps) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: props.onDrop,
    accept: {
      "application/pdf": [],
    },
  });

  const border = useColorModeValue("black", "white");

  return (
    <Box
      {...getRootProps()}
      cursor="pointer"
      borderColor={border}
      display="flex"
      borderWidth={1}
      alignItems="center"
      p={5}
      justifyContent={"center"}
      rounded="md"
      className="container"
    >
      <input {...getInputProps()} type="file" />
      <Text>
        {props.fileName ? props.fileName : "Click or drag your BAA in PDF format into the box"}
      </Text>
    </Box>
  );
}
