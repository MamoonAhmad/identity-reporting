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

export const TestCaseList: React.FC<any> = () => {
  const [state, setState] = useGeneralState<{
    testCases: TestValidatorConfigJSON[];
    loading: boolean;
    testCasesBeingDeletedIDs: string[];
  }>({
    testCases: [],
    loading: true,
    testCasesBeingDeletedIDs: [],
  });

  const navigate = useNavigate();

  const getAllTestCases = async () => {
    setState({ loading: true });
    const tests = await new TestCaseService().get({});
    setState({
      loading: false,
      testCases: tests,
    });
  };

  useEffect(() => {
    getAllTestCases();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteTestCase = (testCaseID: string) => {
    setState({
      testCasesBeingDeletedIDs: [...state.testCasesBeingDeletedIDs, testCaseID],
    });
    new TestCaseService().delete(testCaseID).then(() => {
      getAllTestCases().then(() => {
        const testCasesBeingDeletedIDs = state.testCasesBeingDeletedIDs;
        const index = testCasesBeingDeletedIDs.findIndex(
          (s) => s === testCaseID
        );
        testCasesBeingDeletedIDs.splice(index, 1);
        setState({ testCasesBeingDeletedIDs: [...testCasesBeingDeletedIDs] });
      });
    });
  };

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
            <Typography variant="h4">Test Cases</Typography>
            <Button variant="outlined">
              <Link to={"/test_case/create"}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <AddSharp fontSize="medium" sx={{ mr: 1 }} />
                  Create New Test
                </Box>
              </Link>
            </Button>
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
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell>Description</StyledTableCell>
                    <StyledTableCell width={100}>Actions</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {state.testCases.map((t, i) => {
                    return (
                      <StyledTableRow
                        sx={{ cursor: "pointer" }}
                        onClick={() => navigate(`/test_case/${t.id}`)}
                      >
                        <StyledTableCell>{i + 1}</StyledTableCell>
                        <StyledTableCell>{t.name}</StyledTableCell>
                        <StyledTableCell>{t.description}</StyledTableCell>
                        <StyledTableCell>
                          <IconButton
                            color="primary"
                            // onClick={() => navigate(`/test_case/${t.id}`)}
                          >
                            <Link
                              to={`/test_case/${t.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <RemoveRedEyeSharp fontSize="medium" />
                            </Link>
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTestCase(t.id);
                            }}
                          >
                            {state.testCasesBeingDeletedIDs.indexOf(t.id) <
                              0 && (
                              <DeleteSharp fontSize="medium" color="error" />
                            )}
                            {state.testCasesBeingDeletedIDs.indexOf(t.id) >=
                              0 && <CircularProgress size={14} color="error" />}
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
