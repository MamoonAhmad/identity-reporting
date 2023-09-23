import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ExecutedFunction, ExecutedFunction1Type } from "../../ExecutionFunction";
import {
  TestConfig,
  TestConfigForFunction,
  TestConfigForFunctionJSON,
  TestConfigJSON,
} from "../TestRun/TestRunView";
import { useGeneralState } from "../../helpers/useGeneralState";
import { StoreContext } from "../../context/StoreContext";
import { ArrayValidator, Validator } from "../../validators";
import {
  createEntitiesFromDBRecords,
  createExecutedFunctions,
  createMatchersFromValue,
  getValidatorFromJSON,
} from "../../helpers/function";
import { GenericObjectInputView } from "./ObjectInput";
import {
  AddCircleOutlineSharp,
  BugReportSharp,
  DeleteSharp,
  InputSharp,
  OutputSharp,
  UpdateSharp,
} from "@mui/icons-material";
import { LOG_TYPE } from "../../Log";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import logs from "../../tests/data/logs1.json";
import { TestCaseService } from "../../services/base";
import { GenericObjectPathView } from "./ObjectValuePath";
import { SidePanel } from "../SidePanel";

const convertFunctionConfigToJSON = (
  c: TestConfigForFunction
): TestConfigForFunctionJSON => {
  return {
    ...c,
    testCaseValidationConfig: {
      childFunctionExecutions:
        c.testCaseValidationConfig?.childFunctionExecutions?.map((cf) =>
          convertFunctionConfigToJSON(cf)
        ) || [],
      inputData: c.testCaseValidationConfig!.inputData.json(),
      outputData: c.testCaseValidationConfig!.outputData.json(),
      createdObjects: c.testCaseValidationConfig!.createdObjects.json(),
      updatedObjects: c.testCaseValidationConfig!.updatedObjects.json(),
      deletedObjects: c.testCaseValidationConfig!.deletedObjects.json(),
    },
  };
};

const functions = createExecutedFunctions(logs as any);

export const TestCreateView: React.FC = () => {
  const props = useLocation();

  const [state, setState] = useGeneralState<{
    testCase?: TestConfig;
    config: TestConfigForFunction[];
    loading: boolean;
  }>({
    testCase: undefined,
    config: [],
    loading: false,
  });

  useEffect(() => {
    const id = props.pathname?.replace("/test_case/", "");
    new TestCaseService().retrieve(id).then((res) => {
      const testCase: TestConfig = {
        ...res!,
        testCases: res?.config?.map((c) => createConfigsssss(c as any)) || [],
      };
      setState({ testCase: testCase! });
    });
  }, [props.pathname]);

  const saveChanges = useCallback(() => {
    setState({ loading: true });
    new TestCaseService()
      .put({
        ...state.testCase!,
        config:
          state.config.map(
            (c): TestConfigForFunctionJSON => convertFunctionConfigToJSON(c)
          ) || [],
      })
      .then((res) => {
        setState({
          testCase: {
            ...res!,
            testCases:
              res?.config?.map((c) => createConfigsssss(c as any)) || [],
          },
          loading: false,
        });
      });
  }, [state.testCase, state.config, setState]);

  console.log("this is props", props.pathname?.replace("/test_case/", ""));

  console.log(state.config, "this is config");

  const createConfigsssss = (
    c: TestConfigForFunctionJSON
  ): TestConfigForFunction => {
    return {
      ...c,
      testCaseValidationConfig: c?.ignore
        ? undefined
        : {
            inputData: getValidatorFromJSON(
              c.testCaseValidationConfig!.inputData
            ),
            outputData: getValidatorFromJSON(
              c.testCaseValidationConfig!.outputData
            ),
            createdObjects: getValidatorFromJSON(
              c.testCaseValidationConfig!.createdObjects
            ) as ArrayValidator,
            updatedObjects: getValidatorFromJSON(
              c.testCaseValidationConfig!.updatedObjects
            ) as ArrayValidator,
            deletedObjects: getValidatorFromJSON(
              c.testCaseValidationConfig!.deletedObjects
            ) as ArrayValidator,
            childFunctionExecutions:
              c.testCaseValidationConfig!.childFunctionExecutions!.map((c) =>
                createConfigsssss(c)
              ),
          },
    };
  };

  return (
    <Box display="flex" alignItems="flex-start" flexDirection={"column"}>
      <Typography sx={{ mb: 2 }} variant="h6">
        Test Case Data Configuration
      </Typography>
      <TestCreationContextProvider
        onChange={(c) => setState({ config: c })}
        config={state.config}
      >
        <SidePanel />
        {state.loading ? (
          <LinearProgress />
        ) : (
          <>
            {state?.testCase && (
              <CreateTest
                executionFunctions={functions}
                existingFunctionConfig={state.testCase?.testCases || []}
              />
            )}
          </>
        )}
      </TestCreationContextProvider>
      <Button sx={{ mt: 5 }} variant="outlined" onClick={saveChanges}>
        {state?.loading ? <CircularProgress size={"small"} /> : "Save Changes"}
      </Button>
      {JSON.stringify(state.config)}
    </Box>
  );
};

type TestCreateViewProps = {
  executionFunctions: ExecutedFunction1Type[];
  existingFunctionConfig: TestConfigForFunction[];
};

export const CreateTest: React.FC<TestCreateViewProps> = ({
  executionFunctions = [],
  existingFunctionConfig,
}) => {
  const [currentJSON, setCurrentJSON] = useState("");
  const { config } = useContext(TestCreationContext);

  const currentCallback = useRef<(() => any) | null>(null);

  useEffect(() => {
    console.log(currentJSON, "this is current json");
  }, [currentJSON]);

  console.log(existingFunctionConfig, "this is existingFunctionConfig");

  return (
    <>
      <div className="flex flex-col items-start">
        {executionFunctions?.map((e, i) => (
          <FunctionView
            executionFunction={e}
            parentContainer={config}
            existingConfig={existingFunctionConfig[i]}
          />
        ))}
      </div>
    </>
  );
};

type FunctionViewProps = {
  executionFunction: ExecutedFunction1Type;
  parentContainer: TestConfigForFunction[];
  existingConfig?: TestConfigForFunction;
};

type FunctionViewState = {
  inputValidator: Validator;
  outputValidator: Validator;
  createdObjectsValidator: ArrayValidator;
  updatedObjectsValidator: ArrayValidator;
  deletedObjectsValidator: ArrayValidator;
  childFunctions: TestConfigForFunction[];
  ignore: boolean;
};
export const FunctionView: React.FC<FunctionViewProps> = React.memo(
  ({ executionFunction, parentContainer, existingConfig }) => {
    const [state, setState] = useGeneralState<FunctionViewState>({});

    const { emitTestCaseConfig } = useContext(TestCreationContext);

    const {
      setState: setStoreState,
      state: { SidePanelComponents },
    } = useContext(StoreContext);

    useEffect(() => {
      if (!existingConfig) {
        const newState: Partial<FunctionViewState> = {};
        if (!state?.inputValidator) {
          newState.inputValidator = createMatchersFromValue(
            executionFunction?.input_data
          );
        }
        if (!state?.outputValidator) {
          newState.outputValidator = createMatchersFromValue(
            executionFunction?.output_data
          );
        }
        if (!state?.createdObjectsValidator) {
          newState.createdObjectsValidator = createMatchersFromValue(
            executionFunction?.createdObjects
          ) as ArrayValidator;
        }
        if (!state?.deletedObjectsValidator) {
          newState.deletedObjectsValidator = createMatchersFromValue(
            executionFunction?.deletedObjects
          ) as ArrayValidator;
        }
        if (!state?.updatedObjectsValidator) {
          newState.updatedObjectsValidator = createMatchersFromValue(
            executionFunction?.updatedObjects
          ) as ArrayValidator;
        }
        newState.childFunctions = [];

        if (Object.keys(newState).length) {
          setState(newState);
        }
        return;
      }
      state.ignore = existingConfig?.ignore || false;
      if (!existingConfig?.ignore && existingConfig?.executedFunction) {
        state.createdObjectsValidator =
          existingConfig!.testCaseValidationConfig!.createdObjects;
        state.updatedObjectsValidator =
          existingConfig!.testCaseValidationConfig!.updatedObjects;
        state.deletedObjectsValidator =
          existingConfig!.testCaseValidationConfig!.deletedObjects;
        state.inputValidator =
          existingConfig!.testCaseValidationConfig!.inputData;
        state.outputValidator =
          existingConfig!.testCaseValidationConfig!.outputData;
        state.childFunctions = [
          ...(existingConfig?.testCaseValidationConfig
            ?.childFunctionExecutions || []),
        ];
      }
      state.childFunctions = [
        ...(existingConfig?.testCaseValidationConfig?.childFunctionExecutions ||
          []),
      ];

      setState({ ...state });
    }, [existingConfig]);

    const InputComponent = useCallback(() => {
      return (
        <>
          {" "}
          <GenericObjectInputView
            name={"Input"}
            value={executionFunction?.input_data}
            //   peString={`${executionFunction?.entity?.name}.${executionFunction?.entity?.reference_id}.Input`}
            validator={state?.inputValidator}
          />
        </>
      );
    }, [executionFunction?.input_data, state?.inputValidator]);

    const OutputComponent = useCallback(() => {
      return (
        <GenericObjectInputView
          name="Output"
          value={executionFunction?.output_data}
          validator={state?.outputValidator}
        />
      );
    }, [executionFunction?.output_data, state?.outputValidator]);

    const CreatedObjects = useCallback(() => {
      return (
        <GenericObjectInputView
          name="Created Objects"
          value={executionFunction?.createdObjects}
          validator={state?.createdObjectsValidator}
        />
      );
    }, [executionFunction?.createdObjects, state?.createdObjectsValidator]);

    const DeletedObjects = useCallback(() => {
      return (
        <GenericObjectInputView
          name="Deleted Objects"
          value={executionFunction?.deletedObjects}
          validator={state?.deletedObjectsValidator}
        />
      );
    }, [executionFunction?.deletedObjects, state?.deletedObjectsValidator]);

    const UpdatedObjects = useCallback(() => {
      return (
        <GenericObjectInputView
          name="Deleted Objects"
          value={executionFunction?.updatedObjects}
          validator={state?.updatedObjectsValidator}
        />
      );
    }, [executionFunction?.updatedObjects, state?.updatedObjectsValidator]);

    useEffect(() => {
      if (parentContainer) {
        const existing = parentContainer?.find(
          (c) =>
            c.executedFunction?.id === executionFunction?.id &&
            c.executedFunction?.id
        );
        if (!existing) {
          const currentFunctionConfig: TestConfigForFunction = {
            executedFunction: { ...executionFunction },
            testCaseValidationConfig: state?.ignore
              ? undefined
              : {
                  inputData: state?.inputValidator,
                  outputData: state?.outputValidator,
                  updatedObjects: state?.updatedObjectsValidator,
                  deletedObjects: state?.deletedObjectsValidator,
                  createdObjects: state?.createdObjectsValidator,
                  childFunctionExecutions: state.childFunctions,
                },
            ignore: state?.ignore,
          };

          if (!parentContainer) {
            // eslint-disable-next-line no-debugger
            debugger;
          }
          parentContainer.push(currentFunctionConfig);
        } else {
          existing.ignore = state?.ignore;
          if (!state.ignore) {
            existing.testCaseValidationConfig =
              existing.testCaseValidationConfig || ({} as any);
            existing.testCaseValidationConfig!.inputData =
              state?.inputValidator;
            existing.testCaseValidationConfig!.outputData =
              state?.inputValidator;
            existing.testCaseValidationConfig!.updatedObjects =
              state?.updatedObjectsValidator;
            existing.testCaseValidationConfig!.deletedObjects =
              state?.deletedObjectsValidator;
            existing.testCaseValidationConfig!.createdObjects =
              state?.createdObjectsValidator;
            existing.testCaseValidationConfig!.childFunctionExecutions =
              state.childFunctions;
          } else {
            existing.testCaseValidationConfig = undefined;
          }
        }
        emitTestCaseConfig();
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    // const onChildChange = (i: number, config: TestConfigForFunction) => {
    //   state?.childFunctions?.splice(i, 1, config);
    //   setState({ childFunctions: [...state.childFunctions] });
    // };

    const childrenLength = !!executionFunction?.childFunctions?.length;
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
            checked={!state?.ignore}
            onChange={(_e, c) => setState({ ignore: !c })}
            size="small"
          />
          <span className="pl-1">
            {executionFunction?.name}:{" "}
          </span>

          <div className="ml-2 flex items-center font-normal">
            <div
              className="flex items-center cursor-pointer mx-1 text-blue-500"
              onClick={() => {
                setStoreState({
                  SidePanelComponents: [...SidePanelComponents, InputComponent],
                });
              }}
            >
              <InputSharp className="mr-1 mt-0.5" fontSize={"small"} />
              Input
            </div>
            <div
              className="flex items-center cursor-pointer mx-1 text-red-400"
              onClick={() => {
                setStoreState({
                  SidePanelComponents: [
                    ...SidePanelComponents,
                    OutputComponent,
                  ],
                });
              }}
            >
              <OutputSharp className="mt-0.5 mx-1" fontSize="small" /> Output
            </div>

            <div
              className="flex items-center cursor-pointer text-blue-400"
              onClick={() => {
                setStoreState({
                  SidePanelComponents: [...SidePanelComponents, CreatedObjects],
                });
              }}
            >
              <AddCircleOutlineSharp className="mt-0.5 mx-1" fontSize="small" />{" "}
              New
            </div>

            <div
              className="flex items-center cursor-pointer text-blue-400"
              onClick={() => {
                setStoreState({
                  SidePanelComponents: [...SidePanelComponents, UpdatedObjects],
                });
              }}
            >
              <UpdateSharp className="mt-0.5 mx-1" fontSize="small" /> Updates
            </div>

            <div
              className="flex items-center cursor-pointer text-blue-400"
              onClick={() => {
                setStoreState({
                  SidePanelComponents: [...SidePanelComponents, UpdatedObjects],
                });
              }}
            >
              <DeleteSharp className="mt-0.5 mx-1" fontSize="small" /> Deleted
            </div>
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
                {executionFunction?.childFunctions?.map(
                  (executedFunction, i) => (
                    <FunctionView
                      executionFunction={executedFunction}
                      parentContainer={state.childFunctions}
                      existingConfig={
                        existingConfig?.testCaseValidationConfig
                          ?.childFunctionExecutions?.[i]
                      }
                    />
                  )
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);

export const TestCreationContext = React.createContext<{
  emitTestCaseConfig: () => void;
  config: TestConfigForFunction[];
  showObjectPathSelector: (callback: (c: string) => void) => void;
}>({} as any);

const TestCreationContextProvider: React.FC<
  PropsWithChildren<{
    onChange: (config: TestConfigForFunction[]) => void;
    config: TestConfigForFunction[];
  }>
> = ({ children, onChange, config }) => {
  const {
    state: { SidePanelComponents },
    setState: setStoreState,
  } = useContext(StoreContext);
  const emitTestCaseConfig = useCallback(() => {
    onChange(config);
  }, []);

  const showObjectPathSelector = useCallback(
    (callback: (c: string) => void) => {
      setStoreState({
        SidePanelComponents: [
          ...SidePanelComponents,
          () => {
            
            const objs = config.map((c) => gatherObjectsForPath(c));
            return (
              <GenericObjectPathView
                onSelect={callback}
                name="Functions"
                currentPath="Functions"
                value={objs}
                path=""
              />
            );
          },
        ],
      });
    },
    [SidePanelComponents]
  );

  return (
    <TestCreationContext.Provider
      value={{ emitTestCaseConfig, config, showObjectPathSelector }}
    >
      {children}
    </TestCreationContext.Provider>
  );
};


const gatherObjectsForPath = (c: TestConfigForFunction) => {
  const obj: any = {}
  obj[c.executedFunction.name] = {
    input: c.executedFunction?.input_data,
    output: c.executedFunction?.output_data,
  };
  if (c.testCaseValidationConfig?.childFunctionExecutions.length) {
    obj[c.executedFunction.name].childFunctions = []
    c.testCaseValidationConfig?.childFunctionExecutions.forEach(ce => {
      obj[c.executedFunction.name].childFunctions.push(gatherObjectsForPath(ce))
    })
  }

  return obj
}



function testObject(
  source = {
    id: {
      checkExists: true,
      targetValueType: 'number',
      required: true
    },
    name: {
      targetValue: "Some Product"
    }
  }, target = {
    id: 30,
    name: "Some Product"
  }
) {
  return null
}


const obj = {
  purchase: 1,
  customer: {
    first_name: "Mamoon ",
    last_name: "Ahmed",
  }
}


const config = {
  purchase: {
    checkExists: true,
    required: true
  },
  customer: {
    targetValue: {
      first_name: {
        targetValue: "Mamoon"
      },
      last_name: {
        targetValue: "Ahmed"
      }
    }
  }
}

