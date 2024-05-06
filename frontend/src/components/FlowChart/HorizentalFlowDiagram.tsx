import { Box, Button, Typography } from "@mui/material";
import { DiagramEntity, DiagramNodeComponent } from "./types";
import { DiagramWrapper } from "./DiagramWrapper";

export const HorizontalFlowDiagram: React.FC<{
  entities: DiagramEntity[];
  DiagramNodeComponent?: DiagramNodeComponent;
}> = ({ entities, DiagramNodeComponent }) => {
  return (
    <DiagramWrapper entities={entities} drawingFunction={horizontalForwardDraw}>
      {(reDraw) => {
        return (
          <>
            {entities.map((e) => (
              <FunctionBox
                entity={e}
                key={e.id}
                reDraw={reDraw}
                DiagramNodeComponent={DiagramNodeComponent}
              />
            ))}
          </>
        );
      }}
    </DiagramWrapper>
  );
};

const FunctionBox: React.FC<{
  entity: DiagramEntity;
  ml?: number;
  reDraw: () => void;
  DiagramNodeComponent?: DiagramNodeComponent;
}> = ({ entity, ml = 0, reDraw, DiagramNodeComponent }) => {
  return (
    <>
      {DiagramNodeComponent ? (
        <Box id={entity.id} display={"flex"} marginLeft={`${ml}px`} my={2}>
          <DiagramNodeComponent entity={entity} reDraw={reDraw} />
        </Box>
      ) : (
        <Button
          id={entity.id}
          sx={{
            p: 1,
            borderRadius: 2,
            border: "1px solid black",
            my: 2,
            marginLeft: `${ml}px`,
            textTransform: "none",
          }}
          color="inherit"
          onClick={() => {
            entity?.onClick?.(entity);
          }}
        >
          <Typography>{entity.label}</Typography>
        </Button>
      )}

      {entity.children?.map((f) => (
        <FunctionBox
          entity={f}
          key={f.id}
          ml={ml + 100}
          reDraw={reDraw}
          DiagramNodeComponent={DiagramNodeComponent}
        />
      ))}
    </>
  );
};

const horizontalForwardDraw = (ctx: any, entities: DiagramEntity[]) => {
  if (!entities.length) return;
  entities.forEach((e) => drawEntityAndChildren(ctx, e));
};

const drawEntityAndChildren = (
  ctx: CanvasRenderingContext2D,
  entity: DiagramEntity
) => {
  if (!entity.children?.length) {
    return;
  }

  ctx.beginPath();
  const parentEl = document.getElementById(entity.id)!;
  const lastChild = entity.children[entity.children.length - 1];
  const lastChildEl = document.getElementById(lastChild.id)!;

  const parentLeftOffset = parentEl.offsetLeft + 20;
  const parentBottom = parentEl.offsetTop + parentEl.offsetHeight;

  ctx.moveTo(parentLeftOffset, parentBottom);
  ctx.lineTo(
    parentLeftOffset,
    lastChildEl.offsetTop + lastChildEl.offsetHeight / 2
  );

  ctx.stroke();

  entity.children?.forEach((f) => {
    const childEl = document.getElementById(f.id)!;
    const childCenter = childEl.offsetTop + childEl.offsetHeight / 2;

    ctx.beginPath();
    if (f.style?.parentToChildFillColor) {
      ctx.strokeStyle = f.style?.parentToChildFillColor;
      ctx.moveTo(parentLeftOffset, parentBottom);
      ctx.lineTo(parentLeftOffset, childCenter);
    }

    ctx.moveTo(parentLeftOffset, childCenter);
    ctx.lineTo(childEl.offsetLeft, childCenter);
    ctx.stroke();

    ctx.strokeStyle = "black";

    drawEntityAndChildren(ctx, f);

    // if(i !== 0) {
    //   const previousChild = entity.children![i-1];
    //   const previousChildEl = document.getElementById(previousChild.id)!;

    //   ctx.moveTo(childEl.offsetLeft + 20, previousChildEl.offsetTop + previousChildEl.offsetHeight);
    //   ctx.lineTo(childEl.offsetLeft + 20, childEl.offsetTop)
    // }
  });
};
