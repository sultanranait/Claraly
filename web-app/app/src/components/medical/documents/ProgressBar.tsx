import { Box, Card, Flex, Progress, Text } from "@chakra-ui/react";

type QueryStatus = {
  isQuerying: boolean;
  queryProgress?: {
    total: number;
    completed: number;
  };
};

export const ProgressContainer = ({ queryStatus }: { queryStatus: QueryStatus }) => {
  const progressValue = queryStatus.queryProgress?.total
    ? (queryStatus.queryProgress.completed / queryStatus.queryProgress.total) * 100
    : 0;

  if (queryStatus.isQuerying) {
    return (
      <Box
        w={"100%"}
        position="fixed"
        left={0}
        right={0}
        bottom={"100px"}
        display="flex"
        justifyContent="center"
      >
        <Card border={"solid #d3d3d3 1px"} p={5} w={500} mx={5}>
          <Flex mb={2} justifyContent={"space-between"}>
            <Text>Querying documents</Text>
            {queryStatus.queryProgress && (
              <Text>
                {queryStatus.queryProgress.completed} / {queryStatus.queryProgress.total}
              </Text>
            )}
          </Flex>
          <Progress colorScheme={"purple"} hasStripe value={progressValue} />
        </Card>
      </Box>
    );
  }

  return null;
};
