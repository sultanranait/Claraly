import {
  LayoutProps,
  Skeleton,
  Table as ChakraTable,
  TableColumnHeaderProps,
  TableProps as ChakraTableProps,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { ReactNode } from "react";

export type TableProps = ChakraTableProps & {
  columns: string[];
  columnsProps?: TableColumnHeaderProps[];
  children: ReactNode[];
  isLoading?: boolean;
  skeletonHeight?: LayoutProps["height"];
};

export default function table({
  columns,
  columnsProps,
  children,
  isLoading,
  skeletonHeight,
  ...props
}: TableProps) {
  if (columnsProps && columnsProps.length !== columns.length) {
    throw new Error(`Columns and their props do not match`);
  }
  return (
    <ChakraTable {...props}>
      <Thead>
        <Tr>
          {columns.map((column, idx) => (
            <Th {...(columnsProps ? columnsProps[idx] : undefined)} key={idx + "_th"}>
              {column}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {isLoading ? (
          <Tr>
            {columns.map((c, idx) => (
              <Td key={idx + "_col"}>
                <Skeleton height={skeletonHeight}>..</Skeleton>
              </Td>
            ))}
          </Tr>
        ) : children.length <= 0 ? (
          <Tr>
            <Td colSpan={columns.length} textAlign="center">
              Nothing to display
            </Td>
          </Tr>
        ) : (
          children
        )}
      </Tbody>
    </ChakraTable>
  );
}
