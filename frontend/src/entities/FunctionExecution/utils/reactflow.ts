import { Edge, MarkerType, Node } from "reactflow";
import { ExecutedFunction } from "../../../components/NestedObjectView/someutil";

export const createNodesForFunctions = (
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
    const x = functionOffset + (TOTAL_WIDTH - PER_FUNCTION_WIDTH) / 2 ;
    const y = offsetY;

    const obj: Node<any, string | undefined> = {
      id: String(f._id),
      type: "functionNode",
      position: {
        x,
        y: offsetY,
      },
      width: PER_FUNCTION_WIDTH,
      height: PER_FUNCTION_HEIGHT,
      data: {
        label: f.name + `${y},${y}`,
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
          offsetY + 100
        ),
      ];
    }
    functionOffset += TOTAL_WIDTH + 10;
  });
  return arr;
};

export const createEdgesForFunction = (
  functions: ExecutedFunction[],
  parentFunction: ExecutedFunction | null = null
) => {
  let edges: Edge<any>[] = [];

  
  functions.forEach((f) => {
    if (parentFunction) {
      edges.push({
        id: `${parentFunction._id}->${f._id}`,
        source: String(parentFunction._id),
        target: String(f._id),
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

export const findTotalWidthForFunction = (func: ExecutedFunction): number => {
  const PER_FUNCTION_WIDTH = 200;

  return (
    func.children
      ?.map((f) => findTotalWidthForFunction(f))
      ?.reduce((p, c) => p + 20 + c, 0) || PER_FUNCTION_WIDTH + 10
  );
};
