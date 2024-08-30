import {
  Box,
  Grid,
  IconButton,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { CloseSharp } from "@mui/icons-material";
import { NestedObjectTestConfigView } from "./NestedObjectTestConfigViews";
import { useState } from "react";
import { HorizontalFlowDiagram } from "../../../components/FlowChart/HorizontalFlowDiagram.tsx";
import { PyramidFlowDiagram } from "../../../components/FlowChart/PyramidFlowDiagram";
import { DiagramEntity } from "../../../components/FlowChart/types.ts";
import { useObjectChange } from "./useObjectChange.ts";
import {
  FunctionTestConfig,
  TestCaseForFunction,
  TestSuiteForFunction,
} from "../types.ts";

export const TestConfigColumns: React.FC<{
  object: TestCaseForFunction;
  onDelete: () => void;
}> = ({ object: functionTestConfig, onDelete }) => {
  useObjectChange(functionTestConfig, (t) => [t.config]);

  if (!functionTestConfig.config) {
    return null;
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <TestConfigViews config={functionTestConfig.config} />
        </Grid>
      </Grid>
    </>
  );
};

const TestConfigViews: React.FC<{
  config: FunctionTestConfig;
}> = ({ config }) => {
  const [diagramType, setDiagramType] = useState("vertical");

  const [selectedFunctionEntity, setSelectedFunctionEntity] = useState<
    FunctionTestConfig | undefined
  >();

  const onModalClose = () => {
    setSelectedFunctionEntity(undefined);
  };

  const _ = useObjectChange(config);

  const onEntityClick = (e: DiagramEntity) => {
    setSelectedFunctionEntity(e.metaData?.function);
  };
  return (
    <Grid container>
      {/* Config View Buttons */}
      <Grid item xs={12}>
        <Grid display={"flex"}>
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
      </Grid>
      {/* Config View Buttons */}
      <Grid item xs={12}>
        {diagramType === "horizontal" && (
          <HorizontalFlowDiagram
            entities={[
              getDiagramEntityFromExecutedFunction(config, onEntityClick),
            ]}
          />
        )}
        {diagramType === "vertical" && (
          <PyramidFlowDiagram
            entities={[
              getDiagramEntityFromExecutedFunction(config, onEntityClick),
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
              bgcolor: "lightgrey",
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
            <NestedObjectTestConfigView
              object={{
                object: selectedFunctionEntity,
                name: selectedFunctionEntity.functionMeta.name,
              }}
            />
          </Box>
        </Modal>
      )}
    </Grid>
  );
};

const getDiagramEntityFromExecutedFunction = (
  func: FunctionTestConfig,
  onClick?: DiagramEntity["onClick"]
): DiagramEntity => {
  const entity: DiagramEntity = {
    id: func.functionMeta.id,
    label: func.functionMeta.name,
    type: "node",
    metaData: {
      function: func,
    },
    onClick,
    children: [],
  };
  if (func.isMocked) {
    entity.label += " (Mocked)";
  } else {
    entity.children =
      func.children?.map((f) =>
        getDiagramEntityFromExecutedFunction(f, onClick)
      ) || [];
  }
  return entity;
};

export const TestSuiteMetaData: React.FC<{
  testSuite: TestSuiteForFunction;
}> = ({ testSuite }) => {
  return (
    <>
      <Box
        sx={{
          p: 1,
          border: 1,
          borderColor: "ActiveBorder",
          borderRadius: 3,
          my: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{ display: "flex", alignItems: "center" }}
        >
          Function:
          <Typography
            variant="subtitle1"
            color={"info"}
            sx={{ ml: 2 }}
            fontWeight={"bold"}
          >
            {testSuite.functionMeta.name}
          </Typography>
        </Typography>
        <Typography
          variant="body2"
          sx={{ display: "flex", alignItems: "center" }}
        >
          Description:
          <Typography variant="subtitle1" color={"info"} sx={{ ml: 2 }}>
            {testSuite.functionMeta.description || "---"}
          </Typography>
        </Typography>
        <Typography
          variant="body2"
          sx={{ display: "flex", alignItems: "center" }}
        >
          File Name:{" "}
          <Typography variant="subtitle1" color={"info"} sx={{ ml: 2 }}>
            {testSuite.functionMeta.fileName}
          </Typography>
        </Typography>
        <Typography
          variant="body2"
          sx={{ display: "flex", alignItems: "center" }}
        >
          Module Name:
          <Typography variant="subtitle1" color={"info"} sx={{ ml: 2 }}>
            {testSuite.functionMeta.moduleName}
          </Typography>
        </Typography>
      </Box>
    </>
  );
};
