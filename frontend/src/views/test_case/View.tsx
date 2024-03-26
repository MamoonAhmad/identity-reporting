import { Box, Button, Grid, Typography } from "@mui/material";
import axios from "axios";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Edge, Handle, MarkerType, Node, Position } from "reactflow";
import { Flowchart } from "../../components/FlowChart";
import { ViewPage } from "../../components/UICrud/ViewPage";
import {
  NestedObjectColumnItem,
  NestedObjectColumns,
} from "../../components/NestedObjectView/NestedObjectView";
import {
  FunctionTestConfig,
  FunctionTestResult,
  convertFunctionTestConfigToNestedObjectUIItems,
  getChildrenForObject,
  getColumns,
  hasChildren,
} from "../../components/NestedObjectView/someutil";
import { NestedObjectTestConfigView } from "./_NestedObjectTestConfigViews";
import { KeyboardArrowRightSharp } from "@mui/icons-material";

export const ViewFunctionExecution = () => {
  const params = useParams();
  const objectID = params?.["*"];
  return (
    <ViewPage
      title="Function Execution View"
      dataLoader={async () => {
        const res = await axios.get(
          `http://localhost:8002/get-executed-function/${objectID}`
        );
        return res.data;
      }}
      Content={P}
    ></ViewPage>
  );
};

const P: React.FC<{ object: any }> = ({ object }) => {
  const [columns, setColumns] = useState<NestedObjectColumnItem[][]>(
    getColumns(functionTestConfig, [functionTestConfig.functionMeta.name])
  );
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
      <NestedObjectColumns
        objects={columns}
        onObjectSelected={(o) => {
          setColumns(getColumns(functionTestConfig, o.objectPath));
        }}
        DetailView={NestedObjectTestConfigView}
        ListItemView={({ object, selectObject }) => {
          return (
            <Button
              sx={{
                width: "100%",
                height: 20,
                backgroundColor: "white",
                color: "cyan",
                "&:hover": {
                  backgroundColor: "cyan",
                  color: "white",
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                cursor: "pointer",
                textTransform: "none",
              }}
              onClick={() => selectObject()}
            >
              <Typography
                variant="body1"
                sx={{ flexGrow: 1, textAlign: "left" }}
              >
                {object.name}
              </Typography>
              {hasChildren(object.object) ? <KeyboardArrowRightSharp /> : ""}
            </Button>
          );
        }}
      />
    </>
  );
};

type ExecutionViewProps = {
  function: ExecutedFunction;
  onChange: (c: ExecutedFunction) => void;
  onFunctionClick: (executedFunction: ExecutedFunction) => void;
};
export const ExecutionView: React.FC<ExecutionViewProps> = ({
  function: func,
  onFunctionClick,
}) => {
  const nodes = useMemo(
    () => createNodesForFunctions(onFunctionClick as any, [func], null),
    [func]
  );
  const edges = useMemo(() => createEdgesForFunction([func]), [func]);

  return (
    <Grid xs={12} sx={{ display: "flex", alignItems: "flex-start" }}>
      <Flowchart
        edges={edges}
        nodes={nodes}
        nodeTypes={{
          functionNode: FunctionNode,
        }}
      />
    </Grid>
  );
};

type ExecutedFunction = {
  _id: string;
  name: string;
  parentID: string;
  input: any;
  output: any;
  startTime: number;
  endTime: number;
  error?: string;
  executedSuccessfully: boolean;
  traceID: string;
  environmentName: string;
  children?: ExecutedFunction[];
};

const createNodesForFunctions = (
  onClick = () => {
    return;
  },
  functions: ExecutedFunction[],
  parentFunction: ExecutedFunction | null,
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
      id: f._id,
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
    if (f.children?.length) {
      arr = [
        ...arr,
        ...createNodesForFunctions(
          onClick,
          f.children,
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
  functions: ExecutedFunction[],
  parentFunction: ExecutedFunction | null = null
) => {
  let edges: Edge<any>[] = [];

  functions.forEach((f) => {
    if (parentFunction) {
      edges.push({
        id: `${parentFunction._id}->${f._id}`,
        source: parentFunction._id,
        target: f._id,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
      });
    }
    if (f.children?.length) {
      edges = [...edges, ...createEdgesForFunction(f.children, f)];
    }
  });

  return edges;
};

const findTotalWidthForFunction = (func: ExecutedFunction): number => {
  const PER_FUNCTION_WIDTH = 200;

  return (
    func.children
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
      {data?.function?.children?.length ? (
        <Handle type="source" position={Position.Bottom} />
      ) : null}
    </>
  );
}

const functionTestConfig: FunctionTestConfig = {
  _type: "FunctionTestConfig",
  _version: 1,
  isRootFunction: true,
  functionMeta: {
    name: "do_add_line_item",
    _id: "1x1",
  } as any,
  input: {
    _type: "ObjectTestConfig",
    _version: 1,
    expectedValue: {
      some_props1: {
        _type: "ObjectTestConfig",
        _version: 1,
        expectedValue: 1,
        type: "literal",
        ignore: false,
        operator: "strictEqual",
        typeSpecificConfig: {},
      },
      some_props2: {
        _type: "ObjectTestConfig",
        _version: 1,
        expectedValue: 1,
        type: "literal",
        ignore: false,
        operator: "strictEqual",
        typeSpecificConfig: {},
      },
    },
    type: "object",
    ignore: false,
    operator: "equal",
    typeSpecificConfig: {},
  },
  output: {
    _type: "ObjectTestConfig",
    _version: 1,
    expectedValue: 1,
    type: "literal",
    ignore: false,
    operator: "equal",
    typeSpecificConfig: {},
  },
  children: [],
  expectedErrorMessage: undefined,
  ignoreChildren: false,
  shouldHaveBeenCalled: true,
  shouldThrowError: false,
};

// const functionTestResult: FunctionTestResult = {
//     ...functionTestConfig,
//     _type: 'FunctionTestResult',
//     successful: false,
//     failureReason: 'Output does not match.',
//     value: {

//     }
// }
