import { Grid } from "@mui/material";
import { DiagramEntity, DiagramNodeComponent, DrawingFunction } from "./types";
import { useEffect, useRef } from "react";

export const DiagramWrapper: React.FC<{
  entities: DiagramEntity[];
  drawingFunction: DrawingFunction;
  children: (reDraw: () => void) => React.ReactNode;
  DiagramNodeComponent?: DiagramNodeComponent;
}> = ({ entities, drawingFunction, children, DiagramNodeComponent }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    reDraw();
  }, [entities]);

  const wrapperRef = useRef(null);

  const drawLines = () => {
    if (!entities) return;

    const canvas: any = canvasRef.current;
    const ctx = canvas!.getContext("2d");
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.beginPath();

    // for (let a = 0; a < idsArr.length - 1; a++) {
    //   drawFunctionConnectionLine(ctx, idsArr[a], idsArr[a + 1]);
    // }

    drawingFunction(ctx, entities);
    // pyramidFlavor(ctx, func);

    ctx.stroke();
  };

  const reDraw = () => {
    if (!wrapperRef.current || !canvasRef.current) {
      return;
    }
    const wrapperEl: HTMLElement = wrapperRef.current!;
    const canvasEl: HTMLElement = canvasRef.current!;
    canvasEl.setAttribute("width", String(wrapperEl.offsetWidth));
    canvasEl.setAttribute("height", String(wrapperEl.offsetHeight));
    drawLines();
  };

  reDraw();

  return (
    <Grid
      sx={{
        width: "100%",
        p: 0,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
        }}
      >
        <canvas ref={canvasRef} style={{}}></canvas>
      </div>

      <Grid
        item
        xs={12}
        ref={wrapperRef}
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          zIndex: 2,
        }}
      >
        {children(reDraw)}
      </Grid>
    </Grid>
  );
};
