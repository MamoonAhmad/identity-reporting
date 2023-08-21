import { Card } from "@mui/material";
import { ExecutedFunction } from "../../ExecutionFunction";
import { FunctionMeta } from "../../ExecutionFunction";
import { ArrayValidator, Validator, ValidatorConfigJSON } from "../../validators";
import React, { useCallback, useContext, useEffect } from "react";
import { useGeneralState } from "../../helpers/useGeneralState";
import { StoreContext } from "../../context/StoreContext";
import { GenericObjectDiff } from "./ObjectDiff";
import {
  BugReportSharp,
  CheckOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { LOG_TYPE } from "../../Log";


export type TestConfigForFunctionJSON = {
  executedFunction: FunctionMeta;
  ignore: boolean;
  testCaseValidationConfig?: {
    inputData: ValidatorConfigJSON;
    outputData: ValidatorConfigJSON;
    createdObjects: ValidatorConfigJSON;
    deletedObjects: ValidatorConfigJSON;
    updatedObjects: ValidatorConfigJSON;
    childFunctionExecutions: TestConfigForFunctionJSON[];
  };
};

export type TestConfigForFunction = {
  executedFunction: FunctionMeta;
  ignore: boolean;
  testCaseValidationConfig?: {
    inputData: Validator;
    outputData: Validator;
    createdObjects: ArrayValidator;
    deletedObjects: ArrayValidator;
    updatedObjects: ArrayValidator;
    childFunctionExecutions: TestConfigForFunction[];
  };
};

export type TestConfigJSON = {
  id: string;
  name: string;
  description?: string;
  config: TestConfigForFunctionJSON[];
}

export type TestConfig = {
    id: string;
    name: string;
    description?: string;
    testCases: TestConfigForFunction[];
}

export type TestRunViewProps = {
  executedFunctions: ExecutedFunction[];
  testConfig: TestConfig;
};

export const TestRunView: React.FC<TestRunViewProps> = ({
  testConfig,
  executedFunctions,
}) => {
  return (
    <Card>
      <div className="flex flex-col p-5">
        <p className="text-lg text-black my-3">Test Run: {testConfig?.name}</p>
        {testConfig?.testCases?.map((testCase, i) => {
          return (
            <ExecutedFunctionTestResult
              testCase={testCase}
              executedFunction={executedFunctions[i]}
            />
          );
        })}
      </div>
    </Card>
  );
};

type ExecutedFunctionTestResultProps = {
  testCase: TestConfigForFunction;
  executedFunction: ExecutedFunction;
};
export const ExecutedFunctionTestResult: React.FC<ExecutedFunctionTestResultProps> =
  React.memo(({ testCase, executedFunction }) => {
    const [state, setState] = useGeneralState({ isValid: false });

    const { setState: setStoreState, state: storeState } =
      useContext(StoreContext);

    useEffect(() => {
      if (testCase?.executedFunction) {
        testCase.testCaseValidationConfig?.inputData?.match(
          executedFunction?.functionMeta?.input_data
        );
        testCase.testCaseValidationConfig?.outputData?.match(
          executedFunction?.functionMeta?.output_data
        );

        setState({
          isValid:
            testCase.testCaseValidationConfig?.inputData.isValid &&
            testCase.testCaseValidationConfig?.outputData.isValid,
        });
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testCase, executedFunction]);

    const InputComponent: React.FC = useCallback(() => {
      return (
        <GenericObjectDiff
          name={"Input"}
          validator={testCase?.testCaseValidationConfig!.inputData}
        />
      );
    }, [testCase?.testCaseValidationConfig?.inputData]);

    const OutputComponent = useCallback(() => {
      return (
        <GenericObjectDiff
          name={"Output"}
          validator={testCase?.testCaseValidationConfig!.outputData}
        />
      );
    }, [testCase?.testCaseValidationConfig?.outputData]);

    const { isValid } = state;

    return (
      <div
        className={`flex flex-col my-1 ${
          executedFunction?.functionMeta?.parent_id ? "" : "ml-10"
        } `}
        id={executedFunction?.functionMeta.reference_id}
      >
        <p
          className={`flex items-center text-mg font-semibold ${
            isValid ? "text-emerald-800" : "text-amber-900"
          }`}
        >
          {
            <div className="bg-black -ml-7 w-7" style={{ height: 1 }}>
              <div className="w-4 h-4 bg-white border border-black rounded-full -ml-2 -mt-2 flex items-center justify-center">
                <div className="w-3 h-3 bg-white border border-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
              </div>
            </div>
          }
          {executedFunction?.functionMeta?.name}:{" "}
          {!executedFunction?.functionMeta?.executed_successfully ? (
            <span className="flex items-center text-amber-800 my-1 font-normal">
              <BugReportSharp className="mx-1" />
              {executedFunction?.exception ? (
                <>
                  {executedFunction?.exception
                    ?.replace(LOG_TYPE.ERROR, "")
                    .replace(executedFunction?.functionMeta?.name, "")
                    .replace(":", "")}
                </>
              ) : (
                <>Execution Failed</>
              )}
            </span>
          ) : (
            <span className="pl-3 text-sm text-black font-normal">
              {" "}
              {executedFunction?.functionMeta?.description}{" "}
            </span>
          )}
        </p>
        <div
          className="pl-7 flex flex-col border-black"
          style={{
            borderLeft: executedFunction?.childFunctions?.length
              ? "1px solid"
              : "",
          }}
        >
          <ul className="mb-2">
            <li
              className="flex items-center cursor-pointer"
              onClick={() => {
                setStoreState({
                  SidePanelComponents: [
                    ...(storeState?.SidePanelComponents || []),
                    InputComponent,
                  ],
                });
              }}
            >
              Input Validation:{" "}
              {testCase?.testCaseValidationConfig?.inputData?.isValid ? (
                <p className="text-emerald-800">
                  <CheckOutlined /> Successful
                </p>
              ) : (
                <p className="text-amber-800">
                  <CloseOutlined /> Unsuccessful
                </p>
              )}
            </li>
            <li
              className="flex items-center cursor-pointer"
              onClick={() => {
                setStoreState({
                  SidePanelComponents: [
                    ...(storeState?.SidePanelComponents || []),
                    OutputComponent,
                  ],
                });
              }}
            >
              Output Validation:{" "}
              {testCase?.testCaseValidationConfig?.outputData.isValid ? (
                <p className="text-emerald-800">
                  <CheckOutlined /> Successful
                </p>
              ) : (
                <p className="text-amber-800">
                  <CloseOutlined /> Unsuccessful
                </p>
              )}
            </li>
          </ul>

          {testCase?.testCaseValidationConfig?.childFunctionExecutions
            ?.length ? (
            <>
              {testCase?.testCaseValidationConfig?.childFunctionExecutions?.map(
                (childTestCase, i) => (
                  <ExecutedFunctionTestResult
                    testCase={childTestCase}
                    executedFunction={executedFunction?.childFunctions?.[i]}
                    key={childTestCase?.executedFunction?.reference_id}
                  />
                )
              )}
            </>
          ) : null}
        </div>
      </div>
    );
  });

// export const TVT = () => {
//   return (
//     <TestRunView testCase={test_case.childFlows[0]} executionLogs={logs} />
//   );
// };
