import { Grid } from "@mui/material";
import { Handle, Position } from "reactflow";

export function ReactFlowFunctionNode({ data }: any) {
  return (
    <>
      <div>
        {data?.hasParent ? (
          <Handle
            type="target"
            position={Position.Top}
            id={data.function._id}
          />
        ) : null}
        <Grid
          container
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            color: "black",
            padding: 1,
            borderRadius: "4px",
            border: "1px solid gray",
            maxWidth: "200px",
            "&:hover": {
              background: "green",
            },
          }}
          onClick={() => data.onClick(data.function)}
        >
          {data.label}
        </Grid>
        {data?.function?.children?.length ? (
          <Handle
            type="source"
            position={Position.Bottom}
            id={data.function._id}
          />
        ) : null}
      </div>
    </>
  );
}
