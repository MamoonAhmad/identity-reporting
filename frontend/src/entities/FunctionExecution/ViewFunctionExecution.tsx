import { useNavigate, useParams } from "react-router-dom";
import { ViewPage } from "../../components/UICrud/ViewPage";
import { FunctionExecutionServices } from "./services";
import { ExecutedFunction } from "../../components/NestedObjectView/someutil";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  AddSharp,
  CloseSharp,
  ErrorSharp,
  PlayArrowSharp,
} from "@mui/icons-material";
import { TestCaseRoutes } from "../TestCase/routes";
import { HorizontalFlowDiagram } from "../../components/FlowChart/HorizontalFlowDiagram";
import { DiagramEntity } from "../../components/FlowChart/types";
import { PyramidFlowDiagram } from "../../components/FlowChart/PyramidFlowDiagram";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import { JSONTextField } from "../../components/JSONTestField";
import { useObjectChange } from "../TestCase/components/useObjectChange";
import { TestCaseServices } from "../TestCase/services";
import { GeneralObjectView } from "../../components/ObjectView";

export const ViewFunctionExecution = () => {
  const params = useParams();
  const navigate = useNavigate();
  const objectID = params?.["*"];
  if (!objectID) {
    return <>Function ID not present in param.</>;
  }
  return (
    <ViewPage
      objectID={objectID}
      title="Function Execution View"
      dataLoader={async (objectID) =>
        await FunctionExecutionServices.getFunctionExecutionById(objectID)
      }
      Content={P}
      HeaderActions={() => {
        return (
          <Button
            variant="outlined"
            onClick={() =>
              navigate(
                TestCaseRoutes.CreateTestFromExecutedFunction.replace(
                  "*",
                  objectID
                )
              )
            }
          >
            <AddSharp /> Create Test Case
          </Button>
        );
      }}
    ></ViewPage>
  );
};

const P: React.FC<{ object: any }> = ({ object }) => {
  return (
    <>
      <ExecutionView
        function={object}
        onChange={() => {
          ("");
        }}
        onFunctionClick={() => {
          ("");
        }}
      />
    </>
  );
};

type ExecutedFunctionWithMockMeta = Omit<ExecutedFunction, "children"> & {
  callCount: number;
  children: ExecutedFunctionWithMockMeta[];
  isMocked?: boolean;
  mockedErrorMessage?: string;
  mockedOutput?: any;
};
type ExecutionViewProps = {
  function: ExecutedFunction;
  onChange: (c: ExecutedFunction) => void;
  onFunctionClick: (executedFunction: ExecutedFunction) => void;
};
export const ExecutionView: React.FC<ExecutionViewProps> = React.memo(
  ({ function: executedFucntion, onFunctionClick }) => {
    const theme = useTheme();
    const [diagramType, setDiagramType] = useState("horizontal");

    const [selectedFunctionEntity, setSelectedFunctionEntity] =
      useState<ExecutedFunctionWithMockMeta | null>(null);

    const onEntityClick = (e: DiagramEntity) => {
      const executedFunction: ExecutedFunctionWithMockMeta =
        e.metaData?.function;
      setSelectedFunctionEntity(executedFunction);
    };
    const onModalClose = () => {
      setSelectedFunctionEntity(null);
    };

    const [inputToPass, setInputToPass] = useState(executedFucntion?.input);

    const [f, setF] = useState(executedFucntion);
    useEffect(() => {
      setF(executedFucntion);
      setInputToPass(executedFucntion?.input);
    }, [executedFucntion]);

    const func: ExecutedFunctionWithMockMeta = useMemo(() => {
      const callCountMap: { [key: string]: number } = {};
      const visit = (f: ExecutedFunction): ExecutedFunctionWithMockMeta => {
        const key = `${f.moduleName}:${f.name}`;
        const callCount = (callCountMap[key] || 0) + 1;

        const mockContext: { [key: string]: any } = {};
        if (f.executionContext?.is_mocked) {
          mockContext.isMocked = true;
          mockContext.mockedOutput = f.output;
          mockContext.mockedErrorMessage = f.error;
        }

        return {
          ...f,
          children: f.children?.map((c) => visit(c)) || [],
          callCount,
          ...mockContext,
        };
      };

      return visit(f);
    }, [f]);

    const runFunctionWithInput = useCallback(() => {
      const mocks: {
        [key: string]: {
          [callCount: string]: {
            errorToThrow?: string;
            output?: any;
          };
        };
      } = {};
      const visit = (f: ExecutedFunctionWithMockMeta) => {
        if (f.isMocked || f?.executionContext?.is_mocked) {
          const key = `${f.moduleName}:${f.name}`;
          if (!mocks[key]) {
            mocks[key] = {};
          }
          mocks[key][f.callCount] = {
            errorToThrow: f.mockedErrorMessage,
            output: f.mockedOutput,
          };
        }
        f.children?.forEach(visit);
      };

      visit(func);

      TestCaseServices.runFunctionWithInput(
        func,
        inputToPass,
        Object.keys(mocks).length > 0 ? mocks : undefined
      ).then((res) => {
        setF(res.executedFunction);
      });
    }, [func, inputToPass]);

    if (!func) return null;

    return (
      <>
        <Grid container>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <Box
                display={"flex"}
                flexDirection={"column"}
                alignItems={"flex-start"}
                sx={{ my: 2, flexGrow: 1 }}
              >
                <Typography variant="subtitle1" sx={{ mt: 0.2 }}>
                  Execution Time: 38ms
                </Typography>
                {!func.error && (
                  <Typography
                    variant="subtitle1"
                    color={"green"}
                    sx={{ mt: 0.2 }}
                  >
                    Status: Function executed successfully.
                  </Typography>
                )}
                {func.error && (
                  <Typography
                    variant="subtitle1"
                    color={"red"}
                    textAlign={"left"}
                    sx={{ mt: 0.2 }}
                  >
                    {func.error?.split("\n")?.map((s) => (
                      <Typography
                        variant="subtitle1"
                        color={"red"}
                        sx={{ mt: 0.2 }}
                      >
                        {s}
                      </Typography>
                    ))}
                  </Typography>
                )}
              </Box>
              <Button
                sx={{ mx: 2, flexShrink: 0, mt: 2 }}
                onClick={runFunctionWithInput}
              >
                <Typography sx={{ display: "flex", alignItems: "center" }}>
                  <PlayArrowSharp sx={{ mr: 1 }} />
                  Run Function Again
                </Typography>
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} my={2}>
            <JSONTextField
              object={inputToPass}
              onChange={(obj) => setInputToPass(obj)}
              label="Input To Pass (JSON)"
            />
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <ToggleButtonGroup
              size="small"
              color="primary"
              value={diagramType}
              onChange={(_, v) => {
                setDiagramType(v);
              }}
              exclusive
            >
              <ToggleButton value={"horizontal"}>Horizontal</ToggleButton>
              <ToggleButton value={"vertical"}>Vertical</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {diagramType === "horizontal" && (
            <HorizontalFlowDiagram
              DiagramNodeComponent={({ entity }) => {
                const success = !entity.metaData?.function?.error;
                console.log("Button for ", entity.metaData?.function.name);
                return (
                  <Button
                    sx={{
                      p: 1,
                      borderRadius: 4,
                      border: "1px solid black",
                      display: "flex",
                      alignItems: "center",
                      textTransform: "none",
                      color: "black",
                      background: success
                        ? "transparent"
                        : theme.palette.error.light,
                    }}
                    onClick={() =>
                      setSelectedFunctionEntity(entity.metaData?.function)
                    }
                  >
                    {!success ? (
                      <ErrorSharp
                        sx={{ color: theme.palette.error.contrastText }}
                      />
                    ) : null}
                    <Typography
                      sx={{
                        color: !success
                          ? theme.palette.error.contrastText
                          : undefined,
                        ml: 1,
                      }}
                    >
                      {entity.label}
                      <Typography fontWeight={"bold"}>
                        {entity.metaData?.function?.isMocked ? " (Mocked)" : ""}
                      </Typography>
                    </Typography>
                  </Button>
                );
              }}
              entities={[
                getDiagramEntityFromExecutedFunction(func, onEntityClick),
              ]}
            />
          )}
          {diagramType === "vertical" && (
            <PyramidFlowDiagram
              DiagramNodeComponent={({ entity }) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                // const _ = useObjectChange(entity.metaData?.function);
                const success = !entity.metaData?.function?.error;
                return (
                  <Button
                    sx={{
                      p: 1,
                      borderRadius: 4,
                      border: "1px solid black",
                      display: "flex",
                      alignItems: "center",
                      textTransform: "none",
                      color: "black",
                      background: success
                        ? "transparent"
                        : theme.palette.error.light,
                    }}
                    onClick={() =>
                      setSelectedFunctionEntity(entity.metaData?.function)
                    }
                  >
                    {!success ? (
                      <ErrorSharp
                        sx={{ color: theme.palette.error.contrastText }}
                      />
                    ) : null}
                    <Typography
                      sx={{
                        color: !success
                          ? theme.palette.error.contrastText
                          : undefined,
                        ml: 1,
                      }}
                    >
                      {entity.label}
                      <Typography fontWeight={"bold"}>
                        {entity.metaData?.function?.isMocked ? " (Mocked)" : ""}
                      </Typography>
                    </Typography>
                  </Button>
                );
              }}
              entities={[
                getDiagramEntityFromExecutedFunction(func, onEntityClick),
              ]}
            />
          )}
        </Grid>
        {selectedFunctionEntity && (
          <Modal open onClose={onModalClose}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                borderRadius: 1,
                boxShadow: 24,
                p: 4,

                width: "80vw",
                maxHeight: "80vh",
                overflow: "scroll",
              }}
            >
              <IconButton
                sx={{
                  position: "absolute",
                  right: 10,
                  top: 10,
                }}
                onClick={() => onModalClose()}
              >
                <CloseSharp />
              </IconButton>
              <FunctionView executedFunction={selectedFunctionEntity} />
            </Box>
          </Modal>
        )}
      </>
    );
  }
);

const getDiagramEntityFromExecutedFunction = (
  func: ExecutedFunctionWithMockMeta,
  onClick?: DiagramEntity["onClick"]
): DiagramEntity => {
  return {
    id: func.id,
    label: func.name,
    type: "node",
    metaData: {
      function: func,
    },
    onClick,
    children: !func.isMocked
      ? func.children?.map((f) =>
          getDiagramEntityFromExecutedFunction(f, onClick)
        ) || []
      : [],
  };
};

const FunctionView: React.FC<{
  executedFunction: ExecutedFunctionWithMockMeta;
}> = ({ executedFunction }) => {
  const updateObject = useObjectChange(executedFunction, (obj) => [
    obj.mockedOutput,
    obj.mockedErrorMessage,
  ]);
  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h6">{executedFunction.name}</Typography>
      </Grid>
      <Grid item xs={12}>
        {!executedFunction.isMocked ? (
          <Button
            onClick={() => {
              updateObject({
                isMocked: true,
                mockedOutput: executedFunction.output,
                mockedErrorMessage: executedFunction.error,
              });
            }}
          >
            Mock This Function
          </Button>
        ) : (
          <Button
            onClick={() => {
              updateObject({
                isMocked: false,
                mockedOutput: undefined,
                mockedErrorMessage: undefined,
              });
            }}
          >
            UnMock This Function
          </Button>
        )}
      </Grid>
      {executedFunction.isMocked ? (
        <Grid item xs={12}>
          <Grid item xs={6}>
            <Typography variant="caption" fontWeight={"bold"}>
              Mocked Output
            </Typography>
            <JSONTextField
              object={executedFunction.mockedOutput}
              onChange={(obj) => updateObject({ mockedOutput: obj })}
            />
          </Grid>
        </Grid>
      ) : null}
      {!executedFunction.isMocked ? (
        <>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 0.2 }}>
              Execution Time: 38ms
            </Typography>
            {!executedFunction.error && (
              <Typography variant="subtitle1" color={"green"} sx={{ mt: 0.2 }}>
                Status: Function executed successfully.
              </Typography>
            )}
            {executedFunction.error && (
              <>
                <Typography variant="subtitle1" color={"red"} sx={{ mt: 0.2 }}>
                  <>
                    {executedFunction.error?.split("\n").map((s) => (
                      <Typography color={"red"}>{s}</Typography>
                    ))}
                  </>
                </Typography>
              </>
            )}
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" fontWeight={"bold"}>
                  Input
                </Typography>
                <GeneralObjectView
                  sourceObject={executedFunction.input}
                  name=""
                />
              </Grid>
              {!executedFunction.error && (
                <Grid item xs={6}>
                  <Typography variant="caption" fontWeight={"bold"}>
                    Output
                  </Typography>
                  <GeneralObjectView
                    sourceObject={executedFunction.output}
                    name=""
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </>
      ) : null}
    </Grid>
  );
};
