import { ExecutedFunction1Type } from "../../ExecutionFunction";

import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import { useGeneralState } from "../../helpers/useGeneralState";
import { useEffect } from "react";
import { TestCaseService } from "../../services/base";
import { AddSharp, DeleteSharp, RemoveRedEyeSharp } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { TestValidatorConfigJSON } from "../../validators/test";
import { createExecutedFunctions } from "../../helpers/function";
import logs from "../../tests/data/logs1.json";

const functions = createExecutedFunctions(logs as any);

export type ExecutionObject = {
  id: string;
  executed_functions: ExecutedFunction1Type[];
  total_time: number;
  started_at: number;
  ended_at: number;
};

const getExecutions = () => {
  const obj: ExecutionObject = {} as any;
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: 16,
    fontWeight: 400,
    padding: 10,
    "&:first-child": {
      paddingLeft: 20,
    },
    "&:last-child": {
      paddingRight: 20,
    },
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: 0,
    "&:first-child": {
      paddingLeft: 20,
    },
    "&:last-child": {
      paddingRight: 20,
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette?.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export const ExecutionList: React.FC<any> = () => {
  const [state, setState] = useGeneralState<{
    executions: ExecutionObject[];
    loading: boolean;
  }>({
    executions: [],
    loading: true,
  });

  const navigate = useNavigate();

  const getAllExecutions = async () => {
    setState({ loading: true });
    const executions = await getRecentExecutions();
    setState({
      loading: false,
      executions,
    });
  };

  useEffect(() => {
    getAllExecutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteTestCase = (testCaseID: string) => null;

  return (
    <>
      <Container>
        <Grid container spacing={2}>
          <Grid
            xs={12}
            flexDirection={"row"}
            justifyContent={"space-between"}
            display={"flex"}
            mt={2}
            mb={3}
          >
            <Typography variant="h4">Recent Executions</Typography>
          </Grid>
          {state.loading && (
            <Grid xs={12}>
              <CircularProgress size={50} />
            </Grid>
          )}
          {!state.loading && (
            <Grid xs={12}>
              <Table>
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell>#</StyledTableCell>
                    <StyledTableCell>Execution Name</StyledTableCell>
                    <StyledTableCell>Total Time (ms)</StyledTableCell>
                    <StyledTableCell width={100}>Actions</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {state.executions.map((t, i) => {
                    return (
                      <StyledTableRow
                        sx={{ cursor: "pointer" }}
                        onClick={() => navigate(`/test_case/${t.id}`)}
                      >
                        <StyledTableCell>{i + 1}</StyledTableCell>
                        <StyledTableCell>
                          {t.executed_functions[0].name}
                        </StyledTableCell>
                        <StyledTableCell>{t.total_time}ms</StyledTableCell>
                        <StyledTableCell>
                          <IconButton
                            color="primary"
                            // onClick={() => navigate(`/test_case/${t.id}`)}
                          >
                            <Link
                              to={`/executions/${t.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <RemoveRedEyeSharp fontSize="medium" />
                            </Link>
                          </IconButton>
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};

async function getRecentExecutions() {
  const arr: ExecutionObject[] = [];

  for (let a = 0; a < 10; a++) {
    arr.push({
      id: "d06cbf0a-4934-4ad4-bd7f-02f368363b92",
      started_at: 1698687660000,
      ended_at: 1698687660200,
      total_time: 100,
      executed_functions: functions,
    });
  }
  return arr;
}
