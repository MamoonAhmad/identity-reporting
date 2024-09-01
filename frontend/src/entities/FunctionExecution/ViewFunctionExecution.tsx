import { useNavigate, useParams } from "react-router-dom";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AddSharp,
  CloseSharp,
  ErrorSharp,
  PlayArrowSharp,
  RedoSharp,
  UndoSharp,
} from "@mui/icons-material";
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

import { FunctionExecutionServices } from "./services";
import { TestCaseRoutes } from "../TestCase/routes";
import { HorizontalFlowDiagram } from "../../components/FlowChart/HorizontalFlowDiagram";
import { DiagramEntity } from "../../components/FlowChart/types";
import { PyramidFlowDiagram } from "../../components/FlowChart/PyramidFlowDiagram";
import { JSONTextField } from "../../components/JSONTestField";
import { useObjectChange } from "../TestCase/components/useObjectChange";
import { GeneralObjectView } from "../../components/ObjectView";
import { PageTitle } from "../../components/PageTitle";
import { BackDropLoading } from "../../components/BackDropLoading";
import { ExecutedFunction } from "./types";
import { FunctionMetaData } from "./components/FunctionMetaData";

export const ViewFunctionExecution: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const objectID = params?.["*"];

  const [object, setObject] = useState<ExecutedFunction | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!objectID) return;
    setLoading(true);
    FunctionExecutionServices.getFunctionExecutionById(objectID).then((res) => {
      setObject(res);
      setLoading(false);
    });
  }, [objectID]);

  return (
    <Grid container>
      <PageTitle title="Executed Function">
        <Button
          variant="outlined"
          onClick={() =>
            navigate(
              `${TestCaseRoutes.CreateTestFromExecutedFunction}/${
                objectID || ""
              }`
            )
          }
        >
          <AddSharp /> Create New Test Suite
        </Button>
      </PageTitle>
      {loading && <BackDropLoading />}
      {!loading && object && <ExecutionView function={object} />}
    </Grid>
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
};
export const ExecutionView: React.FC<ExecutionViewProps> = React.memo(
  ({ function: executedFucntion }) => {
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

      FunctionExecutionServices.runFunctionWithInput(
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
          <FunctionMetaData executedFunction={func} />
          <Grid item xs={12} my={2}>
            <JSONTextField
              object={inputToPass}
              onChange={(obj) => setInputToPass(obj)}
              label="Input To Pass (JSON)"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <Button onClick={runFunctionWithInput}>
                <Typography sx={{ display: "flex", alignItems: "center" }}>
                  <PlayArrowSharp sx={{ mr: 1 }} />
                  Run Function Again
                </Typography>
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} display={"flex"} mt={2}>
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
      <FunctionMetaData executedFunction={executedFunction} />
      <Grid item xs={12}>
        {!executedFunction.isMocked ? (
          <Button
            variant="outlined"
            onClick={() => {
              updateObject({
                isMocked: true,
                mockedOutput: executedFunction.output,
                mockedErrorMessage: executedFunction.error,
              });
            }}
            sx={{ my: 3 }}
          >
            <RedoSharp sx={{ mr: 0.3 }} fontSize="small" />
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
            sx={{ my: 3 }}
            variant="outlined"
          >
            <UndoSharp sx={{ mr: 0.3 }} fontSize="small" />
            Un Mock This Function
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
