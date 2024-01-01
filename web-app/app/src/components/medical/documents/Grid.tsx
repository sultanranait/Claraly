import { DocumentReference as FHIRDocumentReference } from "@medplum/fhirtypes";
import { createContext, useMemo, useState } from "react";
import { Icon, Box, Text, useColorModeValue } from "@chakra-ui/react";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
import { RenderHeaderCellProps, SortColumn } from "react-data-grid";
import { ActionsRowContent } from "./RowActions";
import DataGrid, { ColumnWithSort } from "../../shared/DataGrid";
import { formatDate } from "../../shared/date";
import { bytesToSize } from "../../shared/util";
import { Button } from "../../shared/Button";
import { isDownloading } from "./";

const NA = "--";
const metriportCode = "METRIPORT";

type Filters = {
  description: string;
  size: string;
  contentType: string;
  organization: string;
  dateCreated: string;
};

type Row = Filters & {
  actions: string;
};

type TableColumn = Omit<ColumnWithSort<Row>, "key"> & { key: keyof Filters };

type GridProps = {
  docs: FHIRDocumentReference[];
  isDownloading: isDownloading;
  onDownloadFile?: (
    docId: string,
    docFilename: string,
    conversionType?: "html" | "pdf"
  ) => Promise<void>;
};

const FilterContext = createContext<Filters | undefined>(undefined);

export function Grid({ docs, isDownloading, onDownloadFile }: GridProps) {
  const [isColumnFilter, toggleColumnFilter] = useState<boolean>(false);
  const [filters, setFilters] = useState(
    (): Filters => ({
      description: "",
      size: "",
      contentType: "",
      organization: "",
      dateCreated: "",
    })
  );

  const [sortColumns, setSortColumns] = useState<SortColumn[]>([]);

  const textColor = useColorModeValue("black", "white");

  const tableColumns = createTableColumns({
    columns: [
      {
        key: "description",
        name: "Description",
        sortType: "string",
      },
      {
        key: "size",
        name: "Size",
        sortType: "number",
        renderCell: ({ row }: { row: Row }) => {
          return <Text textColor={textColor}>{bytesToSize(parseInt(row.size))}</Text>;
        },
      },
      {
        key: "contentType",
        name: "Content Type",
        sortType: "string",
      },
      {
        key: "organization",
        name: "Organization",
        sortType: "string",
      },
      {
        key: "dateCreated",
        name: "Date Created",
        sortType: "date",
      },
    ],
    isColumnFilter,
    setSortColumns,
    filters,
    setFilters,
    textColor,
  });

  const columns: ColumnWithSort<Row>[] = [
    ...tableColumns,
    {
      key: "actions",
      name: "",
      renderCell: ({ row }: { row: Row }) => {
        return <ActionsRowContent {...JSON.parse(row.actions)} onDownloadFile={onDownloadFile} />;
      },
      sortable: false,
      renderHeaderCell: () => (
        <Box display={"flex"}>
          <Button onClick={() => toggleColumnFilter(!isColumnFilter)} alignSelf={"flex-end"}>
            {isColumnFilter ? "Hide" : "Show"} Column Filter
          </Button>
        </Box>
      ),
    },
  ];

  const rows = createTableRows({ docs, isDownloading });

  const filteredRows = useMemo(() => {
    let newRows = rows;

    if (sortColumns.length !== 0) {
      newRows = [...rows].sort((a, b) => {
        for (const sort of sortColumns) {
          const sortType = columns.find(c => c.key === sort.columnKey)?.sortType;

          const comparator = getComparator(sortType, sort.columnKey);
          const compResult = comparator(a, b);
          if (compResult !== 0) {
            return sort.direction === "ASC" ? compResult : -compResult;
          }
        }

        return 0;
      });
    }

    return newRows.filter(r => {
      return (
        (filters.description
          ? r.description.toLowerCase().includes(filters.description.toLowerCase())
          : true) &&
        (filters.size ? r.size.toLowerCase().includes(filters.size.toLowerCase()) : true) &&
        (filters.contentType
          ? r.contentType.toLowerCase().includes(filters.contentType.toLowerCase())
          : true) &&
        (filters.organization
          ? r.organization.toLowerCase().includes(filters.organization.toLowerCase())
          : true) &&
        (filters.dateCreated
          ? r.dateCreated.toLowerCase().includes(filters.dateCreated.toLowerCase())
          : true)
      );
    });
  }, [rows, filters, sortColumns]);

  return (
    <FilterContext.Provider value={filters}>
      <DataGrid<Row>
        headerRowHeight={isColumnFilter ? 80 : 60}
        rowHeight={80}
        sortColumns={sortColumns}
        columns={columns}
        rows={filteredRows}
        renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
      />
    </FilterContext.Provider>
  );
}

function createTableColumns({
  columns,
  isColumnFilter,
  setSortColumns,
  filters,
  setFilters,
  textColor,
}: {
  columns: TableColumn[];
  isColumnFilter: boolean;
  setSortColumns: (sortColumns: SortColumn[]) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  textColor: string;
}): ColumnWithSort<Row>[] {
  return columns.map(column => {
    return {
      resizable: true,
      sortable: true,
      headerCellClass: "filter-cell",
      renderHeaderCell: (p: RenderHeaderCellProps<Row>) => (
        <FilterRenderer<Row>
          isColumnFilter={isColumnFilter}
          setSortColumns={setSortColumns}
          textColor={textColor}
          {...p}
        >
          {props => (
            <input
              className="filter-class"
              {...props}
              value={filters[column.key]}
              onChange={e =>
                setFilters({
                  ...filters,
                  [column.key]: e.target.value,
                })
              }
              onKeyDown={inputStopPropagation}
            />
          )}
        </FilterRenderer>
      ),
      renderCell: ({ row }: { row: Row }) => {
        return <Text textColor={textColor}>{row[column.key]}</Text>;
      },
      ...column,
    };
  });
}

const createTableRows = ({ docs, isDownloading }: GridProps): Row[] => {
  return docs
    .sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    })
    .map(doc => {
      const row: Row = {
        description: "",
        size: "",
        contentType: "",
        organization: "",
        dateCreated: "",
        actions: "",
      };

      row["description"] = doc.description ?? NA;
      row["size"] = doc.content?.[0]?.attachment?.size
        ? doc.content[0].attachment.size.toString()
        : NA;
      row["contentType"] = getContentType(doc) ?? NA;
      row["organization"] = getOrganizationName(doc) ?? NA;
      row["dateCreated"] = doc.date ? formatDate(doc.date) : NA;

      row["actions"] = JSON.stringify({
        doc,
        isDownloading,
      });

      return row;
    });
};

const getContentType = (doc: FHIRDocumentReference) => {
  if (doc.content) {
    const metriportContent = doc.content.find(
      c => c.extension?.[0]?.valueCoding?.code === metriportCode
    );

    return metriportContent?.attachment?.contentType;
  }
};

const getOrganizationName = (doc: FHIRDocumentReference): string | undefined => {
  if (doc.contained) {
    const org = doc.contained.flatMap(c => (c.resourceType === "Organization" ? c : []))[0];
    if (org) return org.name;
  }
  return undefined;
};

function inputStopPropagation(event: React.KeyboardEvent<HTMLInputElement>) {
  if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.stopPropagation();
  }
}

function FilterRenderer<R>({
  tabIndex,
  sortDirection,
  setSortColumns,
  textColor,
  isColumnFilter,
  column,
  children,
}: RenderHeaderCellProps<R> & {
  children: (args: { tabIndex: number }) => React.ReactElement;
  isColumnFilter: boolean;
  setSortColumns: (sortColumns: SortColumn[]) => void;
  textColor: string;
}) {
  const setSort = () => {
    if (sortDirection === "ASC") {
      setSortColumns([
        {
          columnKey: column.key,
          direction: "DESC",
        },
      ]);
    } else if (sortDirection === "DESC") {
      setSortColumns([]);
    } else {
      setSortColumns([
        {
          columnKey: column.key,
          direction: "ASC",
        },
      ]);
    }
  };

  return (
    <>
      <Box userSelect={"none"} display={"flex"} alignItems="center" onClick={setSort}>
        <Text textColor={textColor} mr={2} mb={0}>
          {column.name}
        </Text>
        {sortDirection && (
          <Icon color={textColor} as={sortDirection === "ASC" ? AiFillCaretDown : AiFillCaretUp} />
        )}
      </Box>
      {isColumnFilter && <div>{children({ tabIndex })}</div>}
    </>
  );
}

function EmptyRowsRenderer() {
  return <div style={{ textAlign: "center", gridColumn: "1/-1" }}>Nothing to display</div>;
}

type Comparator = (a: Record<string, string>, b: Record<string, string>) => number;

function getComparator(sortType: string | undefined, sortColumn: string): Comparator {
  switch (sortType) {
    case "string":
      return (a, b) => {
        // Sorts the rows by the value of the string in the column
        const aVal = a[sortColumn] ?? "";
        const bVal = b[sortColumn] ?? "";

        return aVal.localeCompare(bVal);
      };

    case "date":
      return (a, b) => {
        // Sorts the rows by the value of the date in the column
        const aVal = a[sortColumn] ?? "";
        const bVal = b[sortColumn] ?? "";

        return new Date(aVal).getTime() - new Date(bVal).getTime();
      };

    case "number":
      return (a, b) => {
        // Sorts the rows by the value of the number in the column
        const aVal = a[sortColumn] ?? "";
        const bVal = b[sortColumn] ?? "";

        return parseInt(aVal) - parseInt(bVal);
      };
    default:
      throw new Error(`unsupported sortColumn: "${sortColumn}"`);
  }
}
