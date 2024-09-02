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
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {DiagramNodeComponent ? (
          <Box id={entity.id} display={"flex"} my={2}>
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

        <Box
          sx={{ display: "flex", flexDirection: "column", marginLeft: "40px" }}
        >
          {entity.children?.map((f) => (
            <FunctionBox
              entity={f}
              key={f.id}
              ml={ml + 100}
              reDraw={reDraw}
              DiagramNodeComponent={DiagramNodeComponent}
            />
          ))}
        </Box>
      </Box>
    </>
  );
};

/**
 * draw line for every entity
 */
const horizontalForwardDraw = (ctx: any, entities: DiagramEntity[]) => {
  if (!entities.length) return;
  entities.forEach((e) => drawEntityAndChildren(ctx, e));
};

/**
 * Will draw lines for each function by getting their offset coordinates.
 * draw center line which will start from parent right + 20 up until last child top center
 * draw a line from parent top center to center line left
 *
 */
const drawEntityAndChildren = (
  ctx: CanvasRenderingContext2D,
  entity: DiagramEntity,
  backgroundColor = "lightgray",
  defaultStrokeColor = "black"
) => {
  if (!entity.children?.length) {
    return;
  }

  const parentElement = document.getElementById(entity.id)!;

  if (!parentElement) {
    return;
  }

  // set the stoke to default color
  ctx.strokeStyle = defaultStrokeColor;
  ctx.beginPath();

  const lastChild = entity.children[entity.children.length - 1];
  const firstChild = entity.children[0];
  const lastChildElement = document.getElementById(lastChild.id)!;
  const firstChildElement = document.getElementById(firstChild.id)!;

  if (!lastChildElement || !firstChildElement) {
    return;
  }

  const parentRightOffset =
    parentElement.offsetLeft + parentElement.offsetWidth;
  const parentTopCenter =
    parentElement.offsetTop + parentElement.offsetHeight / 2;

  const centerLineLeft = parentRightOffset + 20;

  // Draw a line from parent right and top center to center line
  ctx.moveTo(parentRightOffset, parentTopCenter);
  ctx.lineTo(centerLineLeft, parentTopCenter);

  // Draw a center line
  ctx.moveTo(
    centerLineLeft,
    firstChildElement.offsetTop + firstChildElement.offsetHeight / 2
  );
  ctx.lineTo(
    centerLineLeft,
    lastChildElement.offsetTop + lastChildElement.offsetHeight / 2
  );
  ctx.stroke();

  // connect every child from center line
  entity.children?.forEach((f) => {
    const childEl = document.getElementById(f.id)!;
    const childCenter = childEl.offsetTop + childEl.offsetHeight / 2;

    ctx.beginPath();

    // if the parentToChildFillColor is set, we need to clear the from to this child first
    // and then re draw the line with fill color
    if (f.style?.parentToChildFillColor) {
      // clear line by drawing the line with background color.
      ctx.strokeStyle = backgroundColor;

      // clear from parent right to center line
      ctx.moveTo(parentRightOffset, parentTopCenter);
      ctx.lineTo(centerLineLeft, parentTopCenter);

      // clear center line from parent top to child center
      ctx.moveTo(centerLineLeft, parentTopCenter);
      ctx.lineTo(centerLineLeft, childCenter);

      ctx.stroke();
      ctx.beginPath();

      // fill with parentToChildFillColor
      ctx.strokeStyle = f.style?.parentToChildFillColor;

      // line from parent right to center line
      ctx.moveTo(parentRightOffset, parentTopCenter);
      ctx.lineTo(centerLineLeft, parentTopCenter);

      // line from center line and parent top to child center
      ctx.moveTo(centerLineLeft, parentTopCenter);
      ctx.lineTo(centerLineLeft, childCenter);
    }

    // line from center line to child left
    ctx.moveTo(centerLineLeft, childCenter);
    ctx.lineTo(childEl.offsetLeft, childCenter);
    ctx.stroke();

    // reset the color
    ctx.strokeStyle = defaultStrokeColor;

    // draw children lines
    drawEntityAndChildren(ctx, f, backgroundColor, defaultStrokeColor);
  });
};
