import ReactFlow, { Edge, Node } from "reactflow";

export type FlowChartProps = {
  nodes: Node<any, string | undefined>[];
  edges: Edge<any>[];
  nodeTypes: {
    [key: string]: React.FC;
  };
};
export const Flowchart: React.FC<FlowChartProps> = ({
  nodes,
  edges,
  nodeTypes,
}) => {
  return (
    <div style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        style={{ width: 20000 }}
        nodeTypes={nodeTypes}
      />
    </div>
  );
};
