import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { ArrayValidator, Validator } from "../../validators";
import { TestConfigForFunction } from "../TestRun/TestRunView";
import { ExecutedFunction1Type } from "../../ExecutionFunction";
import { useGeneralState } from "../../helpers/useGeneralState";

import { StoreContext } from "../../context/StoreContext";
import { GenericObjectInputView } from "./ObjectInput";
import { Checkbox } from "@mui/material";
import {
  AddCircleOutlineSharp,
  BugReportSharp,
  DeleteSharp,
  InputSharp,
  OutputSharp,
  UpdateSharp,
} from "@mui/icons-material";
import { LOG_TYPE } from "../../Log";

type FunctionTestCreateProps = {
  existingConfig: TestConfigForFunction;
  onChange: (v: TestConfigForFunction) => void;
};

type FunctionTestCreateState = {
  inputValidator: Validator;
  outputValidator: Validator;
  createdObjectsValidator: ArrayValidator;
  updatedObjectsValidator: ArrayValidator;
  deletedObjectsValidator: ArrayValidator;
  childFunctions: TestConfigForFunction[];
  ignore: boolean;
};
export const FunctionTestCreate: React.FC<FunctionTestCreateProps> = React.memo(
  ({ existingConfig, onChange }) => {
    const [state, setState] = useGeneralState<FunctionTestCreateState>({});
    const executionFunction = existingConfig.executedFunction;

    const config = existingConfig.testCaseValidationConfig;
    const updateConfig = useCallback(
      (v: any) => {
        onChange({
          ...existingConfig,
          testCaseValidationConfig: {
            ...existingConfig,
            ...v,
          },
        });
      },
      [existingConfig]
    );

    // const onChildChange = (i: number, config: TestConfigForFunction) => {
    //   state?.childFunctions?.splice(i, 1, config);
    //   setState({ childFunctions: [...state.childFunctions] });
    // };

    const childrenLength = !!config?.childFunctionExecutions?.length;
    const showChildren = childrenLength && !state?.ignore;

    return (
      <div
        className={`flex flex-col my-1 items-start ${
          executionFunction?.parent_id ? "" : "ml-10"
        } `}
        id={executionFunction?.execution_id}
      >
        <p className={`flex items-center text-mg font-semibold`}>
          {
            <div className="bg-black -ml-7 w-7" style={{ height: 1 }}>
              <div className="w-4 h-4 bg-white border border-black rounded-full -ml-2 -mt-2 flex items-center justify-center">
                <div className="w-3 h-3 bg-white border border-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
              </div>
            </div>
          }

          <Checkbox
            checked={!existingConfig.ignore}
            onChange={(_e, c) => onChange({ ...existingConfig, ignore: !c })}
            size="small"
          />
          <span className="pl-1">{executionFunction?.name}: </span>

          <div className="ml-2 flex items-center font-normal">
            <FunctionInput
              validator={config?.inputData}
              targetObject={executionFunction?.input_data}
              targetObjectKey={"inputData"}
              onChange={updateConfig}
            >
              <InputSharp className="mr-1 mt-0.5" fontSize={"small"} />
              Input1
            </FunctionInput>
            <FunctionInput
              validator={config?.outputData}
              targetObject={executionFunction?.output_data}
              targetObjectKey={"outputData"}
              onChange={updateConfig}
            >
              <OutputSharp className="mt-0.5 mx-1" fontSize="small" /> Output
            </FunctionInput>
            <FunctionInput
              validator={config?.createdObjects}
              targetObject={executionFunction?.createdObjects}
              targetObjectKey={"createdObjects"}
              onChange={updateConfig}
            >
              <AddCircleOutlineSharp className="mt-0.5 mx-1" fontSize="small" />{" "}
              New
            </FunctionInput>
            <FunctionInput
              validator={config?.updatedObjects}
              targetObject={executionFunction?.updatedObjects}
              targetObjectKey={"updatedObjects"}
              onChange={updateConfig}
            >
              <UpdateSharp className="mt-0.5 mx-1" fontSize="small" /> Updates
            </FunctionInput>
            <FunctionInput
              validator={config?.deletedObjects}
              targetObject={executionFunction?.deletedObjects}
              targetObjectKey={"deletedObjects"}
              onChange={updateConfig}
            >
              <DeleteSharp className="mt-0.5 mx-1" fontSize="small" /> Deleted
            </FunctionInput>
          </div>
        </p>

        {/* <p className={`text-mg font-semibold`}>{executionFunction?.functionMeta?.name}</p> */}
        <div
          className="pl-5 flex flex-col items-start"
          style={{
            borderLeft: showChildren ? "1px solid black" : "",
          }}
        >
          {!executionFunction?.executed_successfully ? (
            <span className="flex items-center text-amber-800 my-1 font-normal">
              <BugReportSharp className="mx-1" />
              {executionFunction?.exception ? (
                <>
                  {executionFunction?.exception
                    ?.replace(LOG_TYPE.ERROR, "")
                    .replace(executionFunction?.name, "")
                    .replace(":", "")}
                </>
              ) : (
                <>Execution Failed</>
              )}
            </span>
          ) : (
            <span className="-ml-2 text-sm text-black font-normal">
              {" "}
              {executionFunction?.description}{" "}
            </span>
          )}

          <div className="-ml-5 pl-7">
            {showChildren ? (
              <div className="">
                {config?.childFunctionExecutions?.map((_, i) => (
                  <FunctionTestCreate
                    existingConfig={config!.childFunctionExecutions[i]}
                    onChange={(f) => {
                      const arr = config!.childFunctionExecutions;
                      arr[i] = f;
                      onChange({
                        ...existingConfig,
                        testCaseValidationConfig: {
                          ...existingConfig.testCaseValidationConfig,
                          childFunctionExecutions: arr,
                        } as any,
                        // TODO Typing
                      });
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

const FunctionInput: React.FC<PropsWithChildren<any>> = ({
  targetObject,
  targetObjectKey,
  validator,
  onChange,
  children,
}) => {
  const ObjectConfigEditorComponent = useCallback(() => {
    return (
      <>
        <GenericObjectInputView
          name={"Input"}
          value={targetObject}
          onChange={(v) => onChange({ [targetObjectKey]: v })}
          //   peString={`${executionFunction?.entity?.name}.${executionFunction?.entity?.reference_id}.Input`}
          validator={validator}
        />
      </>
    );
  }, [validator, targetObject]);

  const {
    setState: setStoreState,
    state: { SidePanelComponents },
  } = useContext(StoreContext);

  return (
    <div
      className="flex items-center cursor-pointer mx-1 text-blue-500"
      onClick={() => {
        setStoreState({
          SidePanelComponents: [
            ...SidePanelComponents,
            ObjectConfigEditorComponent,
          ],
        });
      }}
    >
      {children}
    </div>
  );
};
