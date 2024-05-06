import { useNavigate, useParams } from "react-router-dom";
import { ViewPage } from "../../components/UICrud/ViewPage";
import { FunctionExecutionServices } from "./services";
import { ExecutedFunction } from "../../components/NestedObjectView/someutil";
import React, { useState } from "react";

import { AddSharp, CloseSharp } from "@mui/icons-material";
import { TestCaseRoutes } from "../TestCase/routes";
import { HorizontalFlowDiagram } from "../../components/FlowChart/HorizentalFlowDiagram";
import { DiagramEntity } from "../../components/FlowChart/types";
import { PyramidFlowDiagram } from "../../components/FlowChart/PyramidFlowDiagram";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { JSONTextField } from "../../components/JSONTestField";

export const ViewFunctionExecution = () => {
  const params = useParams();
  const navigate = useNavigate();
  const objectID = params?.["*"];
  if (!objectID) {
    return <>Function ID not present in param.</>;
  }
  return (
    <ViewPage
      title="Function Execution View"
      dataLoader={async () =>
        await FunctionExecutionServices.getFunctionExecutionById(objectID)
      }
      Content={P}
      HeaderActions={() => {
        return (
          <Button
            variant="outlined"
            onClick={() =>
              navigate(
                TestCaseRoutes.CreateTestFromExecutedFunction.replace(
                  "*",
                  objectID
                )
              )
            }
          >
            <AddSharp /> Create Test Case
          </Button>
        );
      }}
    ></ViewPage>
  );
};

const P: React.FC<{ object: any }> = ({ object }) => {
  return (
    <>
      <ExecutionView
        function={object}
        onChange={() => {
          ("");
        }}
        onFunctionClick={() => {
          ("");
        }}
      />
    </>
  );
};

type ExecutionViewProps = {
  function: ExecutedFunction;
  onChange: (c: ExecutedFunction) => void;
  onFunctionClick: (executedFunction: ExecutedFunction) => void;
};
export const ExecutionView: React.FC<ExecutionViewProps> = React.memo(
  ({ function: func, onFunctionClick }) => {
    const [diagramType, setDiagramType] = useState("horizontal");

    const [selectedFunctionEntity, setSelectedFunctionEntity] =
      useState<ExecutedFunction | null>(null);

    const onEntityClick = (e: DiagramEntity) => {
      const executedFunction: ExecutedFunction = e.metaData?.function;
      setSelectedFunctionEntity(executedFunction);
    };
    const onModalClose = () => {
      setSelectedFunctionEntity(null);
    };

    if (!func) return null;

    return (
      <>
        <Grid container>
          <Grid
            display={"flex"}
            flexDirection={"column"}
            alignItems={"flex-start"}
            sx={{ my: 2 }}
          >
            <Typography variant="subtitle1" sx={{ mt: 0.2 }}>
              Execution Time: 38ms
            </Typography>
            {!func.error && (
              <Typography variant="subtitle1" color={"green"} sx={{ mt: 0.2 }}>
                Status: Function executed successfully.
              </Typography>
            )}
            {func.error && (
              <Typography variant="subtitle1" color={"red"} sx={{ mt: 0.2 }}>
                Status: Error - {func.error}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} display={"flex"} >
            <ToggleButtonGroup
              size="small"
              color="primary"
              value={diagramType}
              onChange={(_, v) => {
                setDiagramType(v);
              }}
              exclusive
            >
              <ToggleButton value={"horizontal"}>Horizontal</ToggleButton>
              <ToggleButton value={"vertical"}>Vertical</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {diagramType === "horizontal" && (
            <HorizontalFlowDiagram
              entities={[
                getDiagramEntityFromExecutedFunction(func, onEntityClick),
              ]}
            />
          )}
          {diagramType === "vertical" && (
            <PyramidFlowDiagram
              entities={[
                getDiagramEntityFromExecutedFunction(func, onEntityClick),
              ]}
            />
          )}
        </Grid>
        {selectedFunctionEntity && (
          <Modal open onClose={onModalClose}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                borderRadius: 1,
                boxShadow: 24,
                p: 4,

                width: "80vw",
                maxHeight: "80vh",
                overflow: "scroll",
              }}
            >
              <IconButton
                sx={{
                  position: "absolute",
                  right: 10,
                  top: 10,
                }}
                onClick={() => onModalClose()}
              >
                <CloseSharp />
              </IconButton>
              <FunctionView executedFunction={selectedFunctionEntity} />
            </Box>
          </Modal>
        )}
      </>
    );
  }
);

const getDiagramEntityFromExecutedFunction = (
  func: ExecutedFunction,
  onClick?: DiagramEntity["onClick"]
): DiagramEntity => {
  return {
    id: func.executionID,
    label: func.name,
    type: "node",
    metaData: {
      function: func,
    },
    onClick,
    children:
      func.children?.map((f) =>
        getDiagramEntityFromExecutedFunction(f, onClick)
      ) || [],
  };
};

const FunctionView: React.FC<{
  executedFunction: ExecutedFunction;
}> = ({ executedFunction }) => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h6">{executedFunction.name}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" sx={{ mt: 0.2 }}>
          Execution Time: 38ms
        </Typography>
        {!executedFunction.error && (
          <Typography variant="subtitle1" color={"green"} sx={{ mt: 0.2 }}>
            Status: Function executed successfully.
          </Typography>
        )}
        {executedFunction.error && (
          <Typography variant="subtitle1" color={"red"} sx={{ mt: 0.2 }}>
            Status: Error - {executedFunction.error}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" fontWeight={"bold"}>
              Input
            </Typography>
            <JSONTextField
              object={executedFunction.input}
              onChange={() => undefined}
            />
          </Grid>
          {!executedFunction.error && (
            <Grid item xs={6}>
              <Typography variant="caption" fontWeight={"bold"}>
                Output
              </Typography>
              <JSONTextField
                object={executedFunction.output}
                onChange={() => undefined}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};
