import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  NestedObjectColumnItem,
  NestedObjectColumns,
} from "../../../components/NestedObjectView/NestedObjectView";
import {
  ExecutedFunction,
  FunctionTestConfig,
  getColumns,
  hasChildren,
} from "../../../components/NestedObjectView/someutil";
import { CloseSharp, KeyboardArrowRightSharp } from "@mui/icons-material";
import {
  MockedFunctionView,
  NestedObjectContextProvider,
  NestedObjectTestConfigView,
} from "./NestedObjectTestConfigViews";
import { useEffect, useReducer, useState } from "react";
import { HorizontalFlowDiagram } from "../../../components/FlowChart/HorizontalFlowDiagram.tsx";
import { PyramidFlowDiagram } from "../../../components/FlowChart/PyramidFlowDiagram";
import { DiagramEntity } from "../../../components/FlowChart/types.ts";
import { useObjectChange } from "./useObjectChange.ts";

export type TestSuiteForFunction = {
  id: string;
  name: string;
  description: string;
  functionMeta: ExecutedFunction;
  tests: TestCaseForFunction[];
};

export type TestCaseForFunction = {
  id: string;
  inputToPass: any;
  name: string;
  mocks: {
    [functionName: string]: FunctionMockConfig;
  };
  config: FunctionTestConfig;
};

export type FunctionMockConfig = {
  [callCount: number]: {
    output?: any;
    errorToThrow?: string;
  };
};

export const TestConfigColumns: React.FC<{
  object: TestCaseForFunction;
  onDelete: () => void;
}> = ({ object: functionTestConfig, onDelete }) => {

  useObjectChange(functionTestConfig, (t) => [t.config])

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
  const [columns, setColumns] = useState<NestedObjectColumnItem[][]>([]);
  const [selectedFunctionEntity, setSelectedFunctionEntity] = useState<
    FunctionTestConfig | undefined
  >();

  const onModalClose = () => {
    setSelectedFunctionEntity(undefined);
  };

  useEffect(() => {
    if (config) {
      setColumns(getColumns(config, [config.functionMeta.name]));
    }
  }, [config]);

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
            <ToggleButton value={"columns"}>Columns</ToggleButton>
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
        {diagramType === "columns" && (
          <NestedObjectColumns
            objects={columns}
            onObjectSelected={(o) => {
              setColumns(getColumns(config, o.objectPath));
            }}
            DetailView={NestedObjectTestConfigView}
            ListItemView={({ object, selectObject }) => {
              return (
                <Button
                  sx={{
                    width: "100%",
                    p: 2,
                    height: 20,
                    backgroundColor: object.selected ? "blue" : "white",
                    color: object.selected ? "white" : "blue",
                    "&:hover": {
                      backgroundColor: "blue",
                      color: "white",
                    },
                    borderRadius: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    cursor: "pointer",
                    textTransform: "none",
                  }}
                  onClick={() => selectObject()}
                >
                  <Typography
                    variant="body1"
                    sx={{ flexGrow: 1, textAlign: "left" }}
                  >
                    {object.name}
                  </Typography>
                  {hasChildren(object.object) ? (
                    <KeyboardArrowRightSharp />
                  ) : (
                    ""
                  )}
                </Button>
              );
            }}
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

const getObjectPathFromCurrentColumns = (
  columns: NestedObjectColumnItem[][]
) => {
  const objectPath: string[] = [];

  columns.forEach((c) => {
    const id = c.find((o) => o.selected)?.id;
    if (id) {
      objectPath.push(id);
    }
  });

  return objectPath;
};

function visit<T>(
  entity: T,
  process: (o: T) => void,
  getChildren: (o: T) => T[]
) {
  process(entity);
  const children = getChildren(entity);
  children.map((c) => visit(c, process, getChildren));
}

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
