import { Button, Grid, TextField } from "@mui/material";
import {
  TestCaseForFunction,
  TestConfigColumns,
  TestSuiteForFunction,
} from "./ConfigureTestCase";
import { useReducer, useState } from "react";
import { TestCaseServices } from "../services";
import { getFunctionTestConfigForExecutedFunction } from "../../../components/NestedObjectView/someutil";
import { useObjectChange } from "./useObjectChange";
import { JSONTextField } from "../../../components/JSONTestField";

export const TestCaseView: React.FC<{
  testSuite: TestSuiteForFunction;
  selectedTestCaseID: string;
  onSave?: (object: TestSuiteForFunction) => void;
}> = ({ testSuite, selectedTestCaseID, onSave }) => {
  const testCase = testSuite.tests.find((t) => t.id === selectedTestCaseID);

  const updateState = useObjectChange(testCase, (obj) => [
    obj?.name,
    obj?.inputToPass,
  ]);

  const [inputToPassError, setInputToPassError] = useState(false);

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
        <Grid
          width={"100%"}
          sx={{ my: 1 }}
        >
          <JSONTextField
            object={testCase.inputToPass}
            onChange={(obj) => {
              updateState({ inputToPass: obj });
            }}
            label="Input to pass to the function for this test"
          />
          <Button
            onClick={() => {
              TestCaseServices.runFunctionWithInput(
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
        <TestConfigColumns object={testCase} onDelete={() => undefined} />
      </Grid>
    </Grid>
  );
};
