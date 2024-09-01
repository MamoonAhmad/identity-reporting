import { Button, Grid, TextField } from "@mui/material";
import { TestConfigColumns } from "./ConfigureTestCase";
import { useObjectChange } from "./useObjectChange";
import { JSONTextField } from "../../../components/JSONTestField";
import { getFunctionTestConfigForExecutedFunction } from "../utils/getFunctionTestConfigForExecutedFunction";
import { FunctionExecutionServices } from "../../FunctionExecution/services";
import { TestSuiteForFunction } from "../types";

export const TestCaseView: React.FC<{
  testSuite: TestSuiteForFunction;
  selectedTestCaseID: string;
  onSave?: (object: TestSuiteForFunction) => void;
}> = ({ testSuite, selectedTestCaseID }) => {
  const testCase = testSuite.tests.find((t) => t.id === selectedTestCaseID);

  const updateState = useObjectChange(testCase, (obj) => [
    obj?.name,
    obj?.inputToPass,
  ]);

  if (!testCase) {
    return null;
  }

  return (
    <Grid container>
      <Grid xs={12}>
        <TextField
          value={testCase.name}
          fullWidth
          label="Test Case Name"
          onChange={(e) => {
            updateState({ name: e.target.value });
          }}
          sx={{ my: 3 }}
        />
        <Grid width={"100%"} sx={{ my: 1 }}>
          <JSONTextField
            object={testCase.inputToPass}
            onChange={(obj) => {
              updateState({ inputToPass: obj });
            }}
            label="Input to pass to the function for this test"
          />
          <Button
            onClick={() => {
              FunctionExecutionServices.runFunctionWithInput(
                testCase.config.functionMeta,
                testCase.inputToPass
              ).then((res) => {
                updateState({
                  config: getFunctionTestConfigForExecutedFunction(
                    res.executedFunction,
                    true
                  ),
                });
                console.log(res);
              });
            }}
          >
            Run Function with This Input
          </Button>
        </Grid>
        <TestConfigColumns object={testCase} />
      </Grid>
    </Grid>
  );
};
