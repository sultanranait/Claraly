import { Box, HStack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Button } from "../../shared/Button";
import { DateRange } from "../../shared/form/DateRange";
import { Input } from "../../shared/form/Input";
import { GetRecordsParams } from "./";

const docRefDateRangeId = "doc-ref-date-range";
const docRefContentId = "doc-ref-content";
const MIN_CONTENT_LENGTH = 3;

export const Filters = ({
  onGetRecords,
}: {
  onGetRecords: ({ queryIfEmpty, dateFrom, dateTo, content }: GetRecordsParams) => Promise<void>;
}) => {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isSearchDisabled, setIsSearchDisabled] = useState<boolean>(true);

  useEffect(() => {
    const filters = localStorage.getItem("doc_filters");
    if (filters) {
      const { dateFrom, dateTo, content } = JSON.parse(filters);
      setDateFrom(dateFrom);
      setDateTo(dateTo);
      setContent(content);
    }
  }, []);

  useEffect(() => {
    const isDisabled = Boolean(
      content && content.length > 0 && content.length < MIN_CONTENT_LENGTH
    );
    setIsSearchDisabled(isDisabled);
  }, [content]);

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setContent("");
    onGetRecords({});
  };

  const doSearch = () => !isSearchDisabled && onGetRecords({ dateFrom, dateTo, content });

  return (
    <Box w={"60%"}>
      <Text mb={1} fontSize={"xl"} fontWeight="bold">
        Search Documents:
      </Text>
      <Text color={"gray.400"} mb={0}>
        This is to search through existing documents that have been queried across the networks
      </Text>
      <HStack alignItems={"end"}>
        <DateRange
          id={docRefDateRangeId}
          isRequired={false}
          label="Filter by date"
          dateFrom={dateFrom}
          dateTo={dateTo}
          onSetToDate={(to: string) => setDateTo(to)}
          onSetFromDate={(from: string) => setDateFrom(from)}
        />
        <Input
          id={docRefContentId}
          value={content}
          isRequired={false}
          label={`Content (min ${MIN_CONTENT_LENGTH} char)`}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value)}
          onEnterKeyPress={doSearch}
        />
        <Button disabled={isSearchDisabled} onClick={doSearch}>
          Search
        </Button>
        <Button
          style={{ backgroundColor: "transparent", borderColor: "#748df0", color: "#748df0" }}
          variant="outline"
          onClick={clearFilters}
        >
          Clear
        </Button>
      </HStack>
    </Box>
  );
};
