import { CheckCircleSharp, DeleteSharp, ErrorSharp } from "@mui/icons-material";
import { Box, CircularProgress, Grid, IconButton } from "@mui/material";
import { useState } from "react";

import { ListPage } from "../../components/UICrud";
import { FunctionExecutionServices } from "./services";
import { PageContainer } from "../../components/PageContainer";
import { PageTitle } from "../../components/PageTitle";
import { Filter } from "../../components/Filter";
import { useListPage } from "../../hooks/useListPage";

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
                  viewLink={(o) =>
                    `/function-execution/view-function-execution/${o.id}`
                  }
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
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const [_loading, _setLoading] = useState(false);
                    if (_loading) {
                      return (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            widows: "100%",
                            height: "100%",
                          }}
                        >
                          <CircularProgress size={20} />
                        </Box>
                      );
                    }
                    return (
                      <>
                        <IconButton
                          onClick={() => {
                            _setLoading(true);

                            fetch(
                              `http://localhost:8002/executed_function/delete-executed-function/${o.id}`,
                              {
                                method: "POST",
                              }
                            ).then(() => {
                              _setLoading(false);
                              window.location.reload();
                            });
                          }}
                          sx={{ mr: 1 }}
                        >
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
