import { Grid } from "@mui/material";
import { Handle, Position } from "reactflow";

export function ReactFlowFunctionNode({ data }: any) {
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
