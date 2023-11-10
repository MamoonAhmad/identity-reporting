import { ExecutionObject } from "./List";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";

import logs from "../../tests/data/logs1.json";
import { createExecutedFunctions } from "../../helpers/function";
import React, { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGeneralState } from "../../helpers/useGeneralState";
import { ExecutedFunction1Type } from "../../ExecutionFunction";
import ReactFlow, { Edge, Handle, MarkerType, Node, Position } from "reactflow";

const functions = createExecutedFunctions(logs as any);

export const ExecutionViewPage: React.FC<any> = () => {
  const params = useParams();
  const id = params?.["*"];

  const [state, setState] = useGeneralState<{
    execution: ExecutionObject | null;
    loading: boolean;
    showFunction: boolean;
    functionToShow: ExecutedFunction1Type | null;
  }>({
    execution: null,
    loading: true,
    showFunction: false,
    functionToShow: null,
  });

  useEffect(() => {
    if (!id) {
      return;
    }
    setState({ loading: true });
    getExecution(id).then((e) => {
      setState({ loading: false, execution: e });
    });
  }, [id]);

  return (
    <>
      <Container>
        <Grid container spacing={2}>
          <Grid
            xs={12}
            flexDirection={"row"}
            justifyContent={"space-between"}
            display={"flex"}
            mt={2}
            mb={3}
          >
            <Typography variant="h4">Execution</Typography>
          </Grid>
          {state.loading && (
            <Grid xs={12}>
              <CircularProgress size={50} />
            </Grid>
          )}
          {!state.loading && (
            <Grid xs={12}>
              <ExecutionView
                execution={state.execution!}
                onChange={() => null}
                onFunctionClick={(f) => {
                  setState({ functionToShow: f, showFunction: true });
                }}
              />
            </Grid>
          )}
        </Grid>
      </Container>
      <ExecutedFunctionDialog
        open={state.showFunction}
        executedFunction={state.functionToShow!}
        onClose={() => setState({ showFunction: false, functionToShow: null })}
      />
    </>
  );
};

type ExecutionViewProps = {
  execution: ExecutionObject;
  onChange: (c: ExecutionObject) => void;
  onFunctionClick: (executedFunction: ExecutedFunction1Type) => void;
};
export const ExecutionView: React.FC<ExecutionViewProps> = ({
  execution,
  onFunctionClick,
}) => {
  const nodes = useMemo(
    () =>
      createNodesForFunctions(onFunctionClick, execution.executed_functions),
    [execution]
  );
  const edges = useMemo(
    () => createEdgesForFunction(execution.executed_functions),
    [execution]
  );

  console.log(nodes, edges, "nodes, edges,");

  return (
    <Grid xs={12} sx={{ display: "flex", alignItems: "flex-start" }}>
      <Flowchart edges={edges} nodes={nodes} />
    </Grid>
  );
};

async function getExecution(id: string) {
  const e: ExecutionObject = {
    id,
    started_at: 1698687660000,
    ended_at: 1698687660200,
    total_time: 100,
    executed_functions: [
      ...createExecutedFunctions(logs as any),
      ...createExecutedFunctions(logs as any),
      ...createExecutedFunctions(logs as any),
    ],
  };

  return e;
}

import "reactflow/dist/style.css";
import { NestedObjectView } from "../../components/NestedObjectView/NestedObjectView";
import {
  BugReportSharp,
  CloseSharp,
  CreateSharp,
  DeleteSharp,
  InfoSharp,
  MessageSharp,
  UpdateSharp,
  WarningSharp,
} from "@mui/icons-material";
import { LOG_TYPE, Log1 } from "../../Log";
const initialNodes = [
  { id: "1", position: { x: 100, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 200, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

type FlowChartProps = {
  nodes: Node<any, string | undefined>[];
  edges: Edge<any>[];
};
const Flowchart: React.FC<FlowChartProps> = ({ nodes, edges }) => {
  // const handleNodeClick = (event, nodeId) => {
  //   alert(`Node ${nodeId} clicked!`);
  // };
  // const onConnect = useCallback((params) => setState((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        style={{ width: 20000 }}
        nodeTypes={{
          functionNode: FunctionNode,
        }}
      />
    </div>
  );
};

const createNodesForFunctions = (
  onClick = (_: ExecutedFunction1Type) => {
    return;
  },
  functions: ExecutedFunction1Type[],
  parentFunction: ExecutedFunction1Type | null = null,
  offsetX = 0,
  offsetY = 0
) => {
  const PER_FUNCTION_WIDTH = 200;
  const PER_FUNCTION_HEIGHT = 200;

  let functionOffset = offsetX;

  let arr: Node<any, string | undefined>[] = [];
  functions?.forEach((f) => {
    const TOTAL_WIDTH = findTotalWidthForFunction(f);
    const x = functionOffset + (TOTAL_WIDTH - PER_FUNCTION_WIDTH) / 2;
    const y = offsetY;

    const obj: Node<any, string | undefined> = {
      id: f.id,
      type: "functionNode",
      position: {
        x,
        y,
      },
      width: PER_FUNCTION_WIDTH,
      height: PER_FUNCTION_HEIGHT,
      data: {
        label: f.name,
        function: f,
        onClick,
        hasParent: !!parentFunction,
      },
    };
    arr.push(obj);
    if (f.childFunctions?.length) {
      arr = [
        ...arr,
        ...createNodesForFunctions(
          onClick,
          f.childFunctions,
          f,
          functionOffset,
          offsetY + PER_FUNCTION_HEIGHT
        ),
      ];
    }
    functionOffset += TOTAL_WIDTH + 10;
  });
  return arr;
};

const createEdgesForFunction = (
  functions: ExecutedFunction1Type[],
  parentFunction: ExecutedFunction1Type | null = null
) => {
  let edges: Edge<any>[] = [];

  functions.forEach((f) => {
    if (parentFunction) {
      edges.push({
        id: `${parentFunction.id}->${f.id}`,
        source: parentFunction.id,
        target: f.id,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
      });
    }
    if (f.childFunctions?.length) {
      edges = [...edges, ...createEdgesForFunction(f.childFunctions, f)];
    }
  });

  return edges;
};

const findTotalWidthForFunction = (func: ExecutedFunction1Type): number => {
  const PER_FUNCTION_WIDTH = 200;

  return (
    func.childFunctions
      ?.map((f) => findTotalWidthForFunction(f))
      ?.reduce((p, c) => p + 20 + c, 0) || PER_FUNCTION_WIDTH + 10
  );
};

function FunctionNode({ data }: any) {
  return (
    <>
      {data?.hasParent ? (
        <Handle type="target" position={Position.Top} />
      ) : null}
      <Grid
        container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textOverflow: "ellipsis",
          overflow: "hidden",
          cursor: "pointer",
          color: "black",
          padding: 1,
          borderRadius: "3%",
          border: "1px solid gray",
          maxWidth: "200px",
          "&:hover": {
            background: "orange",
          },
        }}
        onClick={() => data.onClick(data.function)}
      >
        {data.function?.name}
      </Grid>
      {data?.function?.childFunctions?.length ? (
        <Handle type="source" position={Position.Bottom} />
      ) : null}
    </>
  );
}

type FunctionViewProps = {
  functions: ExecutedFunction1Type;
};
const FunctionView: React.FC<FunctionViewProps> = ({ functions }) => {
  return (
    <Grid container>
      <Grid xs={12} item>
        <Grid container>
          <Grid xs={2}>Input</Grid>
          <Grid xs={8}>
            <Button>s</Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid xs={12} item>
        <Grid container>
          <Grid xs={2}>Input</Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const ExecutedFunctionDialog: React.FC<{
  executedFunction: ExecutedFunction1Type;
  open: boolean;
  onClose: () => void;
}> = ({ executedFunction, open, onClose }) => {
  if (!executedFunction) return null;
  return (
    <BootstrapDialog {...{ open, onClose }} fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h6" margin={0} padding={0} lineHeight={1}>
          {executedFunction.name}
        </Typography>
        {executedFunction.description && (
          <>
            <Typography
              margin={0}
              variant="subtitle1"
              color={"gray"}
              lineHeight={1}
              mt={0.5}
            >
              {executedFunction.description}
            </Typography>
          </>
        )}
        <Typography
          margin={0}
          variant="subtitle1"
          color={"gray"}
          lineHeight={1}
        >
          100 ms
        </Typography>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseSharp />
      </IconButton>
      <DialogContent>
        <ExecutedFunctionLogsView executedFunction={executedFunction} />
      </DialogContent>
    </BootstrapDialog>
  );
};

type ExecutedFunctionLogsViewProps = {
  executedFunction: ExecutedFunction1Type;
};
const ExecutedFunctionLogsView: React.FC<ExecutedFunctionLogsViewProps> = ({
  executedFunction,
}) => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <Grid container>
          <Grid
            item
            xs={3}
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography>Function Input</Typography>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={9} sx={{ pl: 2 }}>
            {JSON.stringify(executedFunction.input_data)}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid
            item
            xs={3}
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography>Function Output</Typography>
            <Typography>:</Typography>
          </Grid>
          <Grid item xs={9} sx={{ pl: 2 }}>
            {JSON.stringify(executedFunction.output_data)}
          </Grid>
        </Grid>
      </Grid>

      {executedFunction?.logs?.length && (
        <Grid item xs={12} mt={3}>
          <Grid container>
            <Grid item xs={12} mb={1}>
              <Typography variant="h6">Logs</Typography>
            </Grid>
            <Grid item xs={12} sx={{ pl: 2 }}>
              {executedFunction?.logs?.map((l) => {
                return (
                  <Grid xs={12} display={"flex"} alignItems={"center"}>
                    <Grid xs={4}>
                      <Typography variant="caption" color={"GrayText"}>
                        {l.logged_at?.toString()}
                      </Typography>
                    </Grid>
                    <Grid xs={0.7}>
                      <LogTypeIcon type={l.log_type as LOG_TYPE} />
                    </Grid>
                    <Grid>
                      <LogMessage log={l} />
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

const LogTypeIcon: React.FC<{ type: LOG_TYPE }> = ({ type }) => {
  switch (type) {
    case LOG_TYPE.CREATE_OBJECT:
      return <CreateSharp color="success" fontSize={"small"} />;

    case LOG_TYPE.UPDATE_OBJECT:
      return <UpdateSharp color="warning" fontSize={"small"} />;

    case LOG_TYPE.DELETE_OBJECT:
      return <DeleteSharp color="error" fontSize={"small"} />;

    case LOG_TYPE.INFO:
      return <InfoSharp color="info" fontSize={"small"} />;

    case LOG_TYPE.WARNING:
      return <WarningSharp color="warning" fontSize={"small"} />;

    case LOG_TYPE.ERROR:
      return <BugReportSharp color="error" fontSize={"small"} />;

    default:
      return <MessageSharp fontSize={"small"} />;
  }
};

const LogMessage: React.FC<{
  log: Log1;
}> = ({ log }) => {
  return (
    <>{log.message && <Typography variant="body2">{log.message}</Typography>}</>
  );
};
