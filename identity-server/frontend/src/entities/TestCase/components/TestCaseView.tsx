import { Button, CircularProgress, Grid, TextField } from "@mui/material";
import { TestConfigColumns } from "./ConfigureTestCase";
import {
  deleteAnyObjectChangeCallback,
  registerAnyObjectChangeCallback,
  useObjectChange,
} from "./useObjectChange";
import { JSONTextField } from "../../../components/JSONTestField";
import { getFunctionTestConfigForExecutedFunction } from "../utils/getFunctionTestConfigForExecutedFunction";
import { FunctionExecutionServices } from "../../FunctionExecution/services";
import {
  FunctionTestConfig,
  TestCaseMocks,
  TestSuiteForFunction,
} from "../types";
import { useEffect, useRef, useState } from "react";

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
  const [runningFunction, setRunningFunction] = useState(false);

  const mocksRef = useRef<TestCaseMocks>({});

  useEffect(() => {
    const key = "TestCaseView";
    registerAnyObjectChangeCallback(
      key,
      (config: FunctionTestConfig) => {
        const key = `${config.functionMeta?.moduleName}:${config.functionMeta?.name}`;
        const mocks = mocksRef.current;

        // Add new mock to the mock config
        if (config.isMocked) {
          if (!mocks[key]) {
            mocks[key] = {};
          }
          mocks[key][config.functionCallCount] = {
            errorToThrow: config.mockedErrorMessage,
            output: config.mockedOutput,
          };
        } else {
          // Delete mock
          if (!mocks[key]) {
            return;
          }
          if (mocks[key][config.functionCallCount]) {
            delete mocks[key][config.functionCallCount];
          }
          if (!Object.keys(mocks[key]).length) {
            delete mocks[key];
          }
        }
      },
      (obj: any) => {
        if ((obj as FunctionTestConfig)._type === "FunctionTestConfig") {
          return true;
        }
        return false;
      }
    );
    return () => deleteAnyObjectChangeCallback(key);
  }, []);

  useEffect(() => {
    if (!testCase) return;
    const visit = (config: FunctionTestConfig) => {
      if (config.isMocked) {
        const key = `${config.functionMeta?.moduleName}:${config.functionMeta?.name}`;
        if (!mocksRef.current[key]) {
          mocksRef.current[key] = {};
        }
        mocksRef.current[key][config.functionCallCount] = {
          errorToThrow: config.mockedErrorMessage,
          output: config.mockedOutput,
        };
      }
      config.children.forEach((c) => visit(c));
    };
    visit(testCase.config);
  }, [testCase]);

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
              setRunningFunction(true);
              FunctionExecutionServices.runFunctionWithInput(
                testCase.config.functionMeta,
                testCase.inputToPass,
                mocksRef.current
              )
                .then((res) => {
                  updateState({
                    config: getFunctionTestConfigForExecutedFunction(
                      res.executedFunction,
                      true
                    ),
                  });
                  console.log(res);
                })
                .finally(() => {
                  setRunningFunction(false);
                });
            }}
          >
            Run Function with This Input
          </Button>
        </Grid>

        {runningFunction && (
          <Grid xs={12} display={"flex"} justifyContent={"flex-start"}>
            <CircularProgress size={40} color="info" />
          </Grid>
        )}
        {!runningFunction && <TestConfigColumns object={testCase} />}
      </Grid>
    </Grid>
  );
};
