import {
  CheckCircle,
  DataObjectSharp,
  ErrorOutlineSharp,
  FolderSharp,
  InfoOutlined,
  TimerSharp,
} from "@mui/icons-material";
import { Button, Grid, Tooltip, Typography, useTheme } from "@mui/material";
import { ExecutedFunction } from "../types";
import { useNavigate } from "react-router-dom";
import { FunctionExecutionRoutes } from "../routes";

export const FunctionMetaData: React.FC<{
  executedFunction: ExecutedFunction;
}> = ({ executedFunction }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Grid container spacing={0.5}>
      {/* Function Name */}
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={2}>
            <Typography
              color={theme.palette.text.secondary}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <InfoOutlined fontSize="small" sx={{ mr: 0.3 }} />
              <Typography fontWeight={"bold"}>Name: </Typography>
            </Typography>
          </Grid>
          <Grid item xs={9} sx={{ display: "flex", alignItems: "center" }}>
            {executedFunction.executedSuccessfully ? (
              <Tooltip title="Function executed successfully." color="success">
                <CheckCircle color="success" fontSize="small" />
              </Tooltip>
            ) : (
              <Tooltip title="Function threw an error." color="error">
                <ErrorOutlineSharp color="error" fontSize="small" />
              </Tooltip>
            )}
            <Typography sx={{ ml: 1 }} fontWeight={"bold"}>
              {executedFunction.name}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={2}>
            <Typography
              color={theme.palette.text.secondary}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <TimerSharp fontSize="small" sx={{ mr: 0.3 }} />
              <Typography fontWeight={"bold"}>Time: </Typography>
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography textAlign={"left"}>
              {executedFunction.totalTime?.toFixed(4)}ms
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      {/* Module Name */}
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={2} sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              color={theme.palette.text.secondary}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <DataObjectSharp fontSize="small" sx={{ mr: 0.3 }} />
              <Typography fontWeight={"bold"}>Module Name: </Typography>
            </Typography>
          </Grid>
          <Grid item xs={9} sx={{ display: "flex", alignItems: "center" }}>
            <Typography textAlign={"left"}>
              {executedFunction?.moduleName}
            </Typography>
            <Tooltip title="View all functions in this module.">
              <Button
                onClick={() =>
                  navigate(
                    `${FunctionExecutionRoutes.FunctionExecutionList}?moduleName=${executedFunction?.moduleName}`
                  )
                }
                sx={{ textTransform: "none", ml: 1, p: 0 }}
                variant="text"
              >
                View All
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={2} sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              color={theme.palette.text.secondary}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FolderSharp fontSize="small" sx={{ mr: 0.3 }} />
              <Typography fontWeight={"bold"}>File Name: </Typography>
            </Typography>
          </Grid>

          <Grid item xs={9} sx={{ display: "flex", alignItems: "center" }}>
            <Typography textAlign={"left"}>
              {executedFunction?.fileName}
            </Typography>
            <Tooltip title="View all functions in this file.">
              <Button
                onClick={() =>
                  navigate(
                    `${FunctionExecutionRoutes.FunctionExecutionList}?fileName=${executedFunction?.fileName}`
                  )
                }
                sx={{ textTransform: "none", ml: 1 }}
                variant="text"
              >
                View All
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
      {/* Error */}
      {executedFunction.error ? (
        <>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={2}>
                <Typography
                  color={theme.palette.text.secondary}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <ErrorOutlineSharp fontSize="small" sx={{ mr: 0.3 }} />
                  <Typography fontWeight={"bold"}>Error: </Typography>
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <Typography textAlign={"left"}>
                  {executedFunction?.error}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {executedFunction?.stackTrace && (
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={2}></Grid>
                <Grid item xs={10}>
                  <Grid container>
                    {executedFunction?.stackTrace?.map((m) => (
                      <Grid xs={12}>
                        <Typography color={"error"} textAlign={"left"} my={0.5}>
                          {m}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </>
      ) : null}
    </Grid>
  );
};
