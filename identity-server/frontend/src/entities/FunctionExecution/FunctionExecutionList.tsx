import { CheckCircleSharp, DeleteSharp, ErrorSharp } from "@mui/icons-material";
import {
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";

import { FunctionExecutionServices } from "./services";
import { PageContainer } from "../../components/PageContainer";
import { PageTitle } from "../../components/PageTitle";
import { Filter } from "../../components/Filter";
import { Link } from "react-router-dom";
import { FunctionExecutionRoutes } from "./routes";
import { useFilters } from "../../hooks/useFilters";
import { ExecutedFunction } from "./types";
import { BackDropLoading } from "../../components/BackDropLoading";

export const FunctionExecutionList: React.FC<any> = () => {
  const [filters, setFilters] = useFilters(["moduleName", "fileName", "name"]);
  const [data, setData] = useState<ExecutedFunction[]>([]);

  useEffect(() => {
    _setLoading(false);
    FunctionExecutionServices.getallFunctionExecutions(filters).then((res) => {
      _setLoading(false);
      setData(res);
    });
  }, [filters]);

  const [_loading, _setLoading] = useState(false);
  return (
    <>
      {_loading && <BackDropLoading />}
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
                            to={`${FunctionExecutionRoutes.ViewFunctionExecution}/${d.id}`}
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
                            to={`${FunctionExecutionRoutes.ViewFunctionExecution}/${d.id}`}
                          >
                            {d.fileName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`${FunctionExecutionRoutes.ViewFunctionExecution}/${d.id}`}
                          >
                            {d.totalTime?.toFixed(2)}ms
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
