export type DiagramEntity = {
  type: "node";
  label: string;
  id: string;
  children: DiagramEntity[];
  metaData?: {
    [key: string]: any
  }
  style?: {
    parentToChildFillColor: string
  }
  onClick?: (e: DiagramEntity) => void;
};

export type DiagramNodeComponent = React.FC<{
  reDraw: () => void;
  entity: DiagramEntity
}>

export type DrawingFunction = (ctx: CanvasRenderingContext2D, entities: DiagramEntity[]) => void;
