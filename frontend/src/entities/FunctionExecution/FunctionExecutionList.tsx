import { CheckCircleSharp, DeleteSharp, ErrorSharp } from "@mui/icons-material";
import {
  Backdrop,
  CircularProgress,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState } from "react";

import { FunctionExecutionServices } from "./services";
import { PageContainer } from "../../components/PageContainer";
import { PageTitle } from "../../components/PageTitle";
import { Filter } from "../../components/Filter";
import { useListPage } from "../../hooks/useListPage";
import { Link } from "react-router-dom";
import { FunctionExecutionRoutes } from "./routes";

export const FunctionExecutionList: React.FC<any> = () => {
  const { data, loading, filters, setFilters } = useListPage(
    FunctionExecutionServices.getallFunctionExecutions,
    ["moduleName", "fileName", "name"]
  );
  const [_loading, _setLoading] = useState(false);
  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading || _loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
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
                <Table>
                  <TableHead>
                    <TableCell>Name</TableCell>
                    <TableCell>File Name</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Action</TableCell>
                  </TableHead>
                  <TableBody>
                    {data.map((d: any) => (
                      <TableRow>
                        <TableCell>
                          <Link
                            to={`/${FunctionExecutionRoutes.ViewFunctionExecution.replace(
                              "*",
                              d.id
                            )}`}
                          >
                            {d?.executedSuccessfully ? (
                              <CheckCircleSharp
                                color="success"
                                sx={{ mr: 1 }}
                              />
                            ) : (
                              <ErrorSharp sx={{ mr: 1 }} color="error" />
                            )}

                            {d.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/${FunctionExecutionRoutes.ViewFunctionExecution.replace(
                              "*",
                              d.id
                            )}`}
                          >
                            {d.fileName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/${FunctionExecutionRoutes.ViewFunctionExecution.replace(
                              "*",
                              d.id
                            )}`}
                          >
                            {d.endTime - d.startTime} ms
                          </Link>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => {
                              _setLoading(true);

                              fetch(
                                `http://localhost:8002/executed_function/delete-executed-function/${d.id}`,
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </Grid>
        </Grid>
      </PageContainer>
    </>
  );
};
