import {
  Box,
  Grid,
  Typography,
  Button,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  CloseSharp,
  EditSharp,
  ErrorSharp,
  PlayArrowSharp,
} from "@mui/icons-material";
import socketIO from "socket.io-client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageContainer } from "../../components/PageContainer";
import { PageTitle } from "../../components/PageTitle";
import { Filter, FilterObjectType } from "../../components/Filter";
import { TestResult } from "./types";
import { TestResultView } from "./components/TestResultView";
import { BACKEND_API_SOCKET_UTL as BACKEND_API_SOCKET_URL } from "../../contants";
import { BACKEND_SOCKET_EVENTS } from "./constants";
import { TestCaseRoutes } from "../TestCase/routes";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "../../components/Accordion";

export const RunAllTests = () => {
  const [filters, setFilters] = useState<FilterObjectType | undefined>(
    undefined
  );
  const [params, setParams] = useSearchParams();

  const [passedTests, setPassedTests] = useState<TestResult[]>([]);
  const [failedTests, setFailedTests] = useState<TestResult[]>([]);
  const [testRunInProgress, setTestRunInProgress] = useState(false);

  useEffect(() => {
    setFilters({
      name: params.get("name") || undefined,
      fileName: params.get("fileName") || undefined,
      moduleName: params.get("moduleName") || undefined,
      testSuiteID: params.get("testSuiteID") || undefined,
    });
  }, [params]);

  const runTestsWithFilters = useCallback(() => {
    if (!filters) {
      return;
    }

    setTestRunInProgress(true);

    setPassedTests([]);
    setFailedTests([]);

    const socket = socketIO(BACKEND_API_SOCKET_URL);
    socket.emit("message", {
      action: BACKEND_SOCKET_EVENTS.RUN_TEST_WITH_FILTER,
      payload: {
        filter: filters,
      },
    });

    socket.on(
      BACKEND_SOCKET_EVENTS.TEST_SUITE_RESULT,
      (testResult: TestResult) => {
        if (testResult.successful) {
          setPassedTests((e) => [...e, testResult]);
        } else {
          setFailedTests((e) => [...e, testResult]);
        }
      }
    );

    socket.on(
      BACKEND_SOCKET_EVENTS.TEST_SUITE_RESULT_ERROR,
      (testResult: TestResult) => {
        setFailedTests((e) => [...e, testResult]);
      }
    );

    socket.on(BACKEND_SOCKET_EVENTS.TEST_RUN_COMPLETE, () => {
      setTestRunInProgress(false);
    });
  }, [filters]);

  useEffect(() => {
    if (testRunInProgress) return;
    runTestsWithFilters();
  }, [runTestsWithFilters]);

  return (
    <PageContainer>
      <PageTitle title="Test Run">
        <Button onClick={runTestsWithFilters} variant="outlined">
          <PlayArrowSharp sx={{ mr: 1 }} />
          Run Tests Again
        </Button>
      </PageTitle>
      {testRunInProgress && <LinearProgress />}
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
              {passedTests.length + failedTests.length}
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
              moduleName: "Module Name",
              testSuiteID: "Test Suite ID",
            }}
            onFilter={(filters) => setParams(new URLSearchParams(filters))}
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
  const navigate = useNavigate();
  return (
    <Accordion
      defaultExpanded={!r.successful && !!r.result}
      disabled={!r.result}
    >
      <AccordionSummary sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ textAlign: "left", flexShrink: 0 }}>
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
        <Typography
          color={"gray"}
          sx={{ ml: 1, flexGrow: 1, textAlign: "left" }}
        >
          ({r.functionMeta?.moduleName})
        </Typography>

        <IconButton
          sx={{ m: 0, p: 0 }}
          onClick={() =>
            navigate(`${TestCaseRoutes.ViewTestCase}/${r.testSuiteID}`)
          }
        >
          <EditSharp fontSize="small" />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails>
        {r.result && <TestResultView result={r} />}
      </AccordionDetails>
    </Accordion>
  );
};
