import { Grid, TextField } from "@mui/material";
import { TestConfigColumns, TestSuiteForFunction } from "./ConfigureTestCase";

export const TestCaseView: React.FC<{
  testSuite: TestSuiteForFunction;
  selectedTestCaseID: string;
}> = ({ testSuite, selectedTestCaseID }) => {
  const testCase = testSuite.tests.find((t) => t.id === selectedTestCaseID);

  if (!testCase) {
    return null;
  }
  return (
    <Grid container>
      <Grid xs={12}>
        <TestConfigColumns object={testCase} onDelete={() => undefined} />
      </Grid>
    </Grid>
  );
};
