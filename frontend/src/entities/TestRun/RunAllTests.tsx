import {
  Accordion as MuiAccordion,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  Box,
  CircularProgress,
  Grid,
  Typography,
  styled,
  AccordionProps,
  AccordionSummaryProps,
  Button,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { TestResult } from "../../components/NestedObjectView/matcher";
import {
  CheckCircle,
  CloseSharp,
  EditSharp,
  ErrorSharp,
  KeyboardArrowDownSharp,
  PendingSharp,
  PlayArrowSharp,
} from "@mui/icons-material";
import { TestResultView } from "./ViewTestRun";
import socketIO from "socket.io-client";
import { TestCaseServices } from "../TestCase/services";
import { TestSuiteForFunction } from "../TestCase/components/ConfigureTestCase";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, FilterObjectType } from "./components/Filter";
import { PageContainer } from "../../components/PageContainer";
import { PageTitle } from "../../components/PageTitle";
import { useListPage } from "../../hooks/useListPage";
import { TestRunRoutes } from "./routes";
import { TestRunServices } from "./services";

const socket = socketIO("http://localhost:8002");

let testRunning = false;

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&::before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<KeyboardArrowDownSharp sx={{ fontSize: "2rem", mx: 0.5 }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .05)",
  minHeight: "auto",
  height: "auto",
  padding: theme.spacing(0.5),

  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(-180deg)",
  },
  "& .MuiAccordionSummary-content": {
    margin: theme.spacing(1),
    marginTop: 0,
    marginBottom: 0,
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(3),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

export const RunAllTests = () => {
  const [filters, setFilters] = useState<FilterObjectType | undefined>(
    undefined
  );
  const [params] = useSearchParams();
  const [totalTestCases, setTotalTestCases] = useState(0);
  const [passedTests, setPassedTests] = useState<TestResult[]>([]);
  const [failedTests, setFailedTests] = useState<TestResult[]>([]);

  useEffect(() => {
    setFilters({
      name: params.get("name") || undefined,
      fileName: params.get("fileName") || undefined,
      moduleName: params.get("moduleName") || undefined,
    });
  }, [params]);

  useEffect(() => {
    if (!filters) {
      return;
    }

    setPassedTests([]);
    setFailedTests([]);
    setTotalTestCases(0);

    testRunning = true;
    socket.emit("message", {
      action: "test_run/run_test",
      payload: {
        filter: filters,
      },
    });
    socket.on("test_run/run_test:stats", (data) => {
      setTotalTestCases(data.total || 0);
    });
    socket.on("test_run/test_run_result", (testResult: TestResult) => {
      if (testResult.successful) {
        setPassedTests((tests) => [...tests, testResult]);
      } else {
        setFailedTests((tests) => [...tests, testResult]);
      }
    });
    socket.on("test_run/test_run_result:error", (testResult: TestResult) => {
      failedTests.push(testResult);
      // setTests((existingTests) => {
      //   const existingTestIndex = existingTests.findIndex(
      //     (t) => t.testCase.id === testResult.testSuiteID
      //   )!;
      //   const existingTest = existingTests[existingTestIndex];
      //   existingTest.result = testResult;
      //   existingTest.inProgress = false;
      //   existingTests[existingTestIndex] = { ...existingTest };
      //   return [...existingTests];
      // });
    });

    socket.on("test_run/test_run_init", (testSuiteID) => {
      // setTests((existingTests) => {
      //   const existingTestIndex = existingTests.findIndex(
      //     (t) => t.testCase.id === testSuiteID
      //   )!;
      //   const existingTest = existingTests[existingTestIndex];
      //   existingTest.inProgress = true;
      //   existingTests[existingTestIndex] = { ...existingTest };
      //   return [...existingTests];
      // });
    });
  }, [filters]);

  // const filteredTests = useMemo(() => {
  //   if (Object.keys(filters).length === 0) {
  //     return tests;
  //   }
  //   return tests.filter((t) => {
  //     if (
  //       filters.moduleName &&
  //       !t.result?.functionMeta?.moduleName?.includes(filters.moduleName)
  //     ) {
  //       return false;
  //     }
  //     if (
  //       filters.fileName &&
  //       !t.result?.functionMeta?.fileName?.includes(filters.fileName)
  //     ) {
  //       return false;
  //     }
  //     if (
  //       filters.testSuiteName &&
  //       !t.result?.testCaseName?.includes(filters.testSuiteName)
  //     ) {
  //       return false;
  //     }
  //     return true;
  //   });
  // }, [filters, tests]);

  return (
    <PageContainer>
      <PageTitle title="Test Run">
        <Button>
          <PlayArrowSharp sx={{ mr: 1 }} />
          Run Tests Again
        </Button>
      </PageTitle>
      <Grid container>
        <Grid item xs={12} my={1} pl={1}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderLeft: "2px solid gray",
              pl: 2,
            }}
          >
            <Typography fontWeight={"bold"} variant="body2" sx={{ mr: 1 }}>
              {totalTestCases}
            </Typography>
            <Typography variant="body2">Total</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderLeft: "2px solid green",
              pl: 2,
            }}
          >
            <Typography
              color={"green"}
              fontWeight={"bold"}
              variant="body2"
              sx={{ mr: 1 }}
            >
              {passedTests?.length}
            </Typography>
            <Typography color={"green"} variant="body2">
              Passed
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderLeft: "2px solid red",
              pl: 2,
            }}
          >
            <Typography
              color={"red"}
              fontWeight={"bold"}
              variant="body2"
              sx={{ mr: 1 }}
            >
              {failedTests?.length}
            </Typography>
            <Typography color={"red"} variant="body2">
              Failed
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} my={2}>
          <Filter
            title="Filter Tests"
            filters={filters || {}}
            filterMap={{
              name: "Test Name",
              functionName: "Function Name",
              moduleName: "Module Name",
            }}
            onFilter={(filters) => setFilters(filters)}
          />
        </Grid>

        {(failedTests.length && (
          <>
            <Grid item xs={12} my={2}>
              <Typography textAlign={"left"} variant="h6">
                Failed Tests
              </Typography>
            </Grid>
            <Grid item xs={12} my={2}>
              {failedTests.map((r) => {
                return <TestSuiteAccordion r={r} />;
              })}
            </Grid>
          </>
        )) ||
          null}

        {(passedTests.length && (
          <>
            <Grid item xs={12} my={2}>
              <Typography textAlign={"left"} variant="h6">
                Passed Tests
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {passedTests.map((r) => {
                return <TestSuiteAccordion r={r} />;
              })}
            </Grid>
          </>
        )) ||
          null}
      </Grid>
    </PageContainer>
  );
};

const TestSuiteAccordion: React.FC<{
  r: TestResult;
}> = ({ r }) => {
  return (
    <Accordion defaultExpanded={!!r.result} disabled={!r.result}>
      <AccordionSummary sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ flexGrow: 1, textAlign: "left" }}>
          {r?.successful && (
            <CheckCircle color="success" fontSize="small" sx={{ mr: 1 }} />
          )}
          {!r?.error && !r.successful && (
            <ErrorSharp color="error" fontSize="small" sx={{ mr: 1 }} />
          )}
          {r.error && !r.successful && (
            <CloseSharp color="error" fontSize="small" sx={{ mr: 1 }} />
          )}
          {r.testCaseName}
        </Typography>
        <Link
          to={`/test-case/view-test-case/${r.testSuiteID}`}
          onClick={(e) => e.stopPropagation()}
          target="_blank"
        >
          <EditSharp sx={{ fontSize: "1.3rem" }} />
        </Link>
      </AccordionSummary>
      <AccordionDetails>
        {r.result && <TestResultView result={r} />}
      </AccordionDetails>
    </Accordion>
  );
};
