import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { TestResult } from "../../components/NestedObjectView/matcher";
import { BugReport, CheckSharp, PendingSharp } from "@mui/icons-material";
import { TestResultView } from "./ViewTestRun";
import socketIO from "socket.io-client";
import { TestCaseServices } from "../TestCase/services";
import { TestSuiteForFunction } from "../TestCase/components/ConfigureTestCase";

const socket = socketIO("http://localhost:8002");

export const RunAllTests = () => {
  const [tests, setTests] = useState<
    {
      testCase: TestSuiteForFunction;
      result?: TestResult;
      inProgress?: boolean;
    }[]
  >([]);
  const result = useMemo<{
    failed: number;
    passed: number;
    inProgress: number;
    pending: number;
  }>(() => {
    if (!tests.length) {
      return { passed: 0, failed: 0 };
    }
    return tests.reduce(
      (acc: any, t) => {
        if (t?.result?.successful) {
          acc.passed++;
        } else if (t?.result && !t?.result?.successful) {
          acc.failed++;
        } else if (t.inProgress) {
          acc.inProgress++;
        } else {
          acc.pending++;
        }
        return acc;
      },
      { passed: 0, failed: 0, inProgress: 0, pending: 0 }
    );
  }, [tests]);

  const [showTests, setShowTests] = useState<"passed" | "failed" | "all">(
    "all"
  );

  useEffect(() => {
    TestCaseServices.getAllTestCases().then((res) => {
      setTests(
        res.map((r: any) => ({
          testCase: r,
          result: undefined,
        }))
      );
      socket.emit("test_run/run_test", []);
      socket.on("test_run/test_run_result", (testResult: TestResult) => {
        setTests((existingTests) => {
          const existingTestIndex = existingTests.findIndex(
            (t) => t.testCase.id === testResult.testSuiteID
          )!;
          const existingTest = existingTests[existingTestIndex];
          existingTest.result = testResult;
          existingTest.inProgress = false;
          existingTests[existingTestIndex] = { ...existingTest };

          return [...existingTests];
        });
        console.log(testResult, "this is result");
      });

      socket.on("test_run/test_run_init", (testSuiteID) => {
        setTests((existingTests) => {
          const existingTestIndex = existingTests.findIndex(
            (t) => t.testCase.id === testSuiteID
          )!;
          const existingTest = existingTests[existingTestIndex];
          existingTest.inProgress = true;
          existingTests[existingTestIndex] = { ...existingTest };

          return [...existingTests];
        });
      });
    });
  }, []);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h4" textAlign={"left"}>
          Test Run
        </Typography>
      </Grid>
      <Grid item xs={12} my={1} pl={1}>
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
            {result?.passed}
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
            {result?.failed}
          </Typography>
          <Typography color={"red"} variant="body2">
            Failed
          </Typography>
        </Box>
      </Grid>

      {(result.inProgress && (
        <>
          <Grid item xs={12} my={2}>
            <Typography textAlign={"left"} variant="h6">
              In Progress
            </Typography>
          </Grid>
          {tests
            .filter((t) => t.inProgress)
            .map((r) => {
              return <TestSuiteAccordion r={r} />;
            })}
        </>
      )) ||
        null}
      {(result.failed && (
        <>
          <Grid item xs={12} my={2}>
            <Typography textAlign={"left"} variant="h6">
              Failed Tests
            </Typography>
          </Grid>
          {tests
            .filter((t) => t.result && !t.result?.successful)
            .map((r) => {
              return <TestSuiteAccordion r={r} />;
            })}
        </>
      )) ||
        null}

      {(result.pending && (
        <>
          <Grid item xs={12} my={2}>
            <Typography textAlign={"left"} variant="h6">
              Pending
            </Typography>
          </Grid>
          {tests
            .filter((t) => !t.inProgress && !t.result)
            .map((r) => {
              return <TestSuiteAccordion r={r} />;
            })}
        </>
      )) ||
        null}

      {(result.passed && (
        <>
          <Grid item xs={12} my={2}>
            <Typography textAlign={"left"} variant="h6">
              Passed Tests
            </Typography>
          </Grid>
          {tests
            .filter((t) => t.result && t.result?.successful)
            .map((r) => {
              return <TestSuiteAccordion r={r} />;
            })}
        </>
      )) ||
        null}
    </Grid>
  );
};

const TestSuiteAccordion: React.FC<{
  r: {
    testCase: TestSuiteForFunction;
    result?: TestResult | undefined;
    inProgress?: boolean;
  };
}> = ({ r }) => {
  return (
    <Grid item xs={12}>
      <Accordion>
        <AccordionSummary disabled={!r.result}>
          <Typography sx={{ display: "flex", alignItems: "center" }}>
            {r.inProgress && <CircularProgress size={15} sx={{ mr: 1 }} />}
            {!r.inProgress && !r.result && (
              <PendingSharp fontSize="small" sx={{ mr: 1 }} />
            )}
            {r.result?.successful && (
              <CheckSharp color="success" fontSize="small" sx={{ mr: 1 }} />
            )}
            {r.result && !r.result?.successful && (
              <BugReport color="error" fontSize="small" sx={{ mr: 1 }} />
            )}
            {r.testCase.name}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {r.result && <TestResultView result={r.result} />}
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};
