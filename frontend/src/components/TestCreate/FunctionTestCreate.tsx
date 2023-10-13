import React, { useEffect } from "react";
import { useGeneralState } from "../../helpers/useGeneralState";

import { Button, Checkbox } from "@mui/material";
import {
  AddCircleOutlineSharp,
  BugReportSharp,
  DeleteSharp,
  InputSharp,
  OutputSharp,
  UpdateSharp,
} from "@mui/icons-material";
import { LOG_TYPE } from "../../Log";
import { getChildrenForObject } from "../NestedObjectView/nestedObjectUtils";
import {
  GeneralObjectDetailView,
  ObjectListItemView,
} from "../NestedObjectView/ConfigureObjectView";
import { NestedObjectView } from "../NestedObjectView/NestedObjectView";
import { FunctionValidator } from "../../validators/function";

type FunctionTestCreateProps = {
  existingConfig: FunctionValidator;
  onChange: (v: FunctionValidator) => void;
  namePath: string[];
};

export const FunctionTestCreate: React.FC<FunctionTestCreateProps> = React.memo(
  ({ existingConfig, onChange, namePath }) => {
    const executionFunction =
      existingConfig.config.targetValue?.executedFunctionMeta;

    const [state, setState] = useGeneralState<{
      showNestedObjectView: boolean;
      namePath: string[];
      nestedObjectTarget: any;
    }>({
      namePath: [],
    });

    const config = existingConfig.config.targetValue.validatorConfig;

    // const onChildChange = (i: number, config: TestConfigForFunction) => {
    //   state?.childFunctions?.splice(i, 1, config);
    //   setState({ childFunctions: [...state.childFunctions] });
    // };

    const childrenLength = !!config?.childFunctions?.length;
    const showChildren = childrenLength && !existingConfig.config.ignore;

    const functionID = `functions.[0].${executionFunction.name}`;

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
            checked={!existingConfig.config.ignore}
            onChange={(_e, c) =>
              onChange(
                new FunctionValidator({ ...existingConfig.config, ignore: !c })
              )
            }
            size="small"
          />
          <span className="pl-1">{executionFunction?.name}: </span>

          <div className="ml-2 flex items-center font-normal">
            <Button
              onClick={() => {
                setState({
                  showNestedObjectView: true,
                  namePath: [functionID, "input"],
                });
              }}
            >
              <InputSharp className="mr-1 mt-0.5" fontSize={"small"} />
              Input
            </Button>
            <Button
              onClick={() => {
                setState({
                  showNestedObjectView: true,
                  namePath: [functionID, "output"],
                });
              }}
            >
              <OutputSharp className="mt-0.5 mx-1" fontSize="small" /> Output
            </Button>
            <Button
              onClick={() => {
                setState({
                  showNestedObjectView: true,
                  namePath: [functionID, "created_objects"],
                });
              }}
            >
              <AddCircleOutlineSharp className="mt-0.5 mx-1" fontSize="small" />{" "}
              New
            </Button>
            <Button
              onClick={() => {
                setState({
                  showNestedObjectView: true,
                  namePath: [functionID, "updated_objects"],
                });
              }}
            >
              <UpdateSharp className="mt-0.5 mx-1" fontSize="small" /> Updates
            </Button>
            <Button
              onClick={() => {
                setState({
                  showNestedObjectView: true,
                  namePath: [functionID, "deleted_objects"],
                });
              }}
            >
              <DeleteSharp className="mt-0.5 mx-1" fontSize="small" /> Deleted
            </Button>
          </div>
        </p>

        {state.showNestedObjectView && (
          <ShowNestedObjectView
            executedFunction={existingConfig}
            namePath={state.namePath}
            onClose={() => setState({ showNestedObjectView: false })}
            onChange={onChange}
            open={true}
          />
        )}

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
                {config?.childFunctions?.map((_, i) => (
                  <FunctionTestCreate
                    namePath={[
                      ...namePath,
                      `functions.${i}.${_.config.targetValue.executedFunctionMeta.name}`,
                    ]}
                    existingConfig={config!.childFunctions[i]}
                    onChange={(f) => {
                      const arr = config!.childFunctions;
                      arr[i] = f;
                      onChange(
                        new FunctionValidator({
                          ...existingConfig.config,
                          targetValue: {
                            ...existingConfig.config.targetValue,
                            validatorConfig: {
                              ...existingConfig.config.targetValue
                                .validatorConfig,
                              childFunctions: [...arr],
                            },
                          },
                          // TODO Typing
                        })
                      );
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

const ShowNestedObjectView: React.FC<{
  onChange: (o: any) => void;
  onClose: () => void;
  open: boolean;
  executedFunction: FunctionValidator;
  namePath: string[];
}> = ({ onChange, open, onClose, namePath, executedFunction }) => {
  const [state, setState] = useGeneralState<{
    namePath: string[];
  }>({
    namePath: [...(namePath || [])],
  });

  useEffect(() => {
    setState({ namePath });
  }, [namePath, setState]);

  return (
    <>
      {open && (
        <NestedObjectView
          open={true}
          onClose={onClose}
          objectPath={state.namePath}
          onObjectPathChange={(o: string[]) => setState({ namePath: [...o] })}
          getChildren={getChildrenForObject}
          ListItemView={ObjectListItemView}
          DetailView={GeneralObjectDetailView}
          title={executedFunction.config.targetValue.executedFunctionMeta.name}
          label="Function"
          initialObjects={[
            {
              id: `functions.[0].${executedFunction.config.targetValue.executedFunctionMeta.name}`,
              name: `${executedFunction.config.targetValue.executedFunctionMeta.name}`,
              object: executedFunction,
              onChange: (o: any) => onChange(o),
            },
          ]}
        />
      )}
    </>
  );
};
