import { useParams } from "react-router-dom";
import { ViewPage } from "../../components/UICrud/ViewPage";
import { FunctionExecutionServices } from "./services";
import { ExecutedFunction } from "../../components/NestedObjectView/someutil";
import { useMemo } from "react";
import { Grid } from "@mui/material";
import { Flowchart } from "../../components/FlowChart";
import { ReactFlowFunctionNode } from "./components/ReactFlowFunctionNode";
import {
  createEdgesForFunction,
  createNodesForFunctions,
} from "./utils/reactflow";

export const ViewFunctionExecution = () => {
  const params = useParams();
  const objectID = params?.["*"];
  if (!objectID) {
    return <>Function ID not present in param.</>;
  }
  return (
    <ViewPage
      title="Function Execution View"
      dataLoader={async () =>
        await FunctionExecutionServices.getFunctionExecutionById(objectID)
      }
      Content={P}
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
          functionNode: ReactFlowFunctionNode,
        }}
      />
    </Grid>
  );
};
