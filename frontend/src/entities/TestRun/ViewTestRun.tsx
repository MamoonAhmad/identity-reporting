import { ViewPage } from "../../components/UICrud/ViewPage";
import { useParams } from "react-router-dom";
import { ExecutedFunction } from "../../components/NestedObjectView/someutil";
import { useEffect, useState } from "react";
import {
  TestResult,
  TestRunForTestSuite,
  matchExecutionWithTestConfig,
} from "../../components/NestedObjectView/matcher";
import { TestResultColumns } from "./components/NestedObjectTestResultView";
import { TestRunServices } from "./services";
import { Grid, Typography } from "@mui/material";
import { BugReportSharp, DoneSharp } from "@mui/icons-material";

export const ViewTestRun = () => {
  const params = useParams();
  const objectID = params?.["*"] || "";
  return (
    <ViewPage
      title="Test Run"
      dataLoader={async () => {
        return await TestRunServices.getTestRunById(objectID);
      }}
      Content={ExecutedFunctionToTestConfigConverter}
    ></ViewPage>
  );
};

const ExecutedFunctionToTestConfigConverter: React.FC<{
  object: TestRunForTestSuite;
}> = ({ object }) => {
  const [result, setResult] = useState<TestResult | undefined>(undefined);

  useEffect(() => {
    if (!object) return;

    const res = matchExecutionWithTestConfig(object);
    setResult(res);
    console.log(res, "This is test result");
  }, [object]);

  if (!result) {
    return null;
  }

  return (
    <>
      {result.result.map((r) => {
        return (
          <Grid
            display={"flex"}
            flexDirection={"column"}
            alignItems={"flex-start"}
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              {r.successful && <DoneSharp color="success" fontSize="large" />}
              {!r.successful && (
                <BugReportSharp color="error" fontSize="large" />
              )}
              {r.expectation}
            </Typography>
            <TestResultColumns object={r.result} />
          </Grid>
        );
      })}
    </>
  );
};
