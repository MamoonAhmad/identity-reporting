import React from "react";
import ReactFlow, { Edge, Node } from "reactflow";

export type FlowChartProps = {
  nodes: Node<any, string | undefined>[];
  edges: Edge<any>[];
  nodeTypes: {
    [key: string]: React.FC;
  };
};
export const Flowchart: React.FC<FlowChartProps> = React.memo(
  ({ nodes, edges, nodeTypes }) => {
    return (
      <div
        style={{ width: "2000px", height: "500px", border: "1px solid #ccc" }}
      >
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} />
      </div>
    );
  }
);
