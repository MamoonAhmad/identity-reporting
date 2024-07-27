import {
  CheckCircleSharp,
  DeleteSharp,
  ErrorSharp,
  VisibilitySharp,
} from "@mui/icons-material";
import { ListPage } from "../../components/UICrud";
import { FunctionExecutionServices } from "./services";
import { Box, CircularProgress, Grid, IconButton } from "@mui/material";
import { PageContainer } from "../../components/PageContainer";
import { PageTitle } from "../../components/PageTitle";
import { Filter } from "../TestRun/components/Filter";

import { useListPage } from "../../hooks/useListPage";
import { Link } from "react-router-dom";

export const FunctionExecutionList: React.FC<any> = () => {
  const { data, loading, filters, setFilters } = useListPage(
    FunctionExecutionServices.getallFunctionExecutions,
    ["moduleName", "fileName", "name"]
  );
  return (
    <>
      <PageContainer>
        <PageTitle title="Executed Functions"></PageTitle>

        <Grid container>
          <Grid item xs={12} my={1}>
            <Filter
              filters={filters || {}}
              filterMap={{
                name: "Function Name",
                fileName: "File Name",
                moduleName: "Module Name",
              }}
              onFilter={setFilters}
              title="Filter Executed Functions"
            />
          </Grid>

          <Grid item xs={12}>
            {loading && <CircularProgress />}
            {data && (
              <>
                <ListPage
                  data={data}
                  keyColumnMap={{
                    name: "Function Name",
                    fileName: "File Name",
                    time: "Time",
                  }}
                  columnOverride={{
                    time: ({ object }) =>
                      `${object.endTime - object.startTime} ms`,
                    name: ({ object }) => (
                      <Box
                        display={"flex"}
                        alignItems={"center"}
                        flexDirection={"row"}
                      >
                        <Box sx={{ mr: 0.5 }}>
                          {object.executedSuccessfully ? (
                            <CheckCircleSharp color="success" />
                          ) : (
                            <ErrorSharp color="error" />
                          )}
                        </Box>
                        {object.name}
                      </Box>
                    ),
                  }}
                  actions={(o) => {
                    return (
                      <>
                        <Link to={`/function-execution/view-function-execution/${o.id}`}>
                          <VisibilitySharp />
                        </Link>
                        <IconButton onClick={() => undefined} sx={{ mr: 1 }}>
                          <DeleteSharp />
                        </IconButton>
                      </>
                    );
                  }}
                />
              </>
            )}
          </Grid>
        </Grid>
      </PageContainer>
    </>
  );
};
