import { Box, Button, Typography } from "@mui/material";
import { DiagramEntity, DiagramNodeComponent } from "./types";
import { DiagramWrapper } from "./DiagramWrapper";

export const PyramidFlowDiagram: React.FC<{
  entities: DiagramEntity[];
  DiagramNodeComponent?: DiagramNodeComponent;
}> = ({ entities, DiagramNodeComponent }) => {
  return (
    <DiagramWrapper entities={entities} drawingFunction={pyramidFlavor}>
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
  // const childHasError = useMemo(
  //   () => func.children?.some((f) => !!f.error),
  //   [func]
  // );
  return (
    <Box display={"flex"} alignItems={"flex-start"} flexDirection={"column"}>
      {DiagramNodeComponent ? (
        <Box id={entity.id} mx={2}>
          <DiagramNodeComponent entity={entity} reDraw={reDraw} />
        </Box>
      ) : (
        <Button
          id={entity.id}
          sx={{
            p: 1,
            borderRadius: 2,
            border: "1px solid black",
            mx: 2,
            display: "flex",
            alignItems: "center",
            textTransform: "none",
            color: "inherit",
          }}
          onClick={() => entity?.onClick?.(entity)}
        >
          <Typography>{entity.label}</Typography>
        </Button>
      )}

      <Box display={"flex"} alignItems={"flex-start"} marginTop={"60px"}>
        {entity.children?.map((f) => (
          <FunctionBox
            entity={f}
            ml={ml + 100}
            reDraw={reDraw}
            DiagramNodeComponent={DiagramNodeComponent}
          />
        ))}
        {/* {func.error && !childHasError && (
            <>
              <Box
                id={`${func.executionID}error`}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  border: "1px solid red",
                  mx: 2,
                  display: "flex",
                  alignItems: "flex-start",
                  maxWidth: 400,
                  // marginLeft: `${ml}px`,
                }}
              >
                <BugReport color="error" />
                <Typography color={"error"}>{func.error}</Typography>
              </Box>
            </>
          )} */}
      </Box>
    </Box>
  );
};

const pyramidFlavor = (ctx: any, entities: DiagramEntity[]) => {
  if (!entities?.length) return;
  entities.forEach((e) => drawEntityAndChildren(ctx, e));
};

const drawEntityAndChildren = (ctx: any, func: DiagramEntity) => {
  // const hasError = func.error && !func.children?.some((f) => !!f.error);
  const children = func.children || [];
  if (!children.length) {
    return null;
  }
  //   if (hasError) {
  //     children.push({ executionID: `${func.executionID}error` } as any);
  //   }
  const parentEl = document.getElementById(func.id);
  if (!parentEl) {
    return;
  }

  const firstChild = func.children[0];

  const firstChildEl = document.getElementById(firstChild.id);

  if (!firstChildEl) {
    return;
  }

  let offsetTop = parentEl.offsetTop + parentEl.offsetHeight;
  const parentCenter = parentEl.offsetLeft + 20;

  if (children.length === 1) {
    ctx.moveTo(parentCenter, offsetTop);
    ctx.lineTo(parentCenter, firstChildEl.offsetTop);
    drawEntityAndChildren(ctx, firstChild);
    return;
  }

  ctx.moveTo(parentCenter, offsetTop);
  ctx.lineTo(parentCenter, offsetTop + 30);

  offsetTop += 30;

  const lastChild = children[children.length - 1];
  const lastChildEl = document.getElementById(lastChild.id)!;

  ctx.moveTo(firstChildEl.offsetLeft + 20, offsetTop);
  ctx.lineTo(lastChildEl.offsetLeft + 20, offsetTop);

  children.forEach((f) => {
    const childEl = document.getElementById(f.id);
    if (!childEl) {
      return;
    }
    ctx.moveTo(childEl.offsetLeft + 20, offsetTop);
    ctx.lineTo(childEl.offsetLeft + 20, childEl.offsetTop);
    drawEntityAndChildren(ctx, f);
  });
};
