import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
  TextField,
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
  getFunctionTestConfigForExecutedFunction,
  hasChildren,
} from "../../../components/NestedObjectView/someutil";
import { CloseSharp, KeyboardArrowRightSharp } from "@mui/icons-material";
import {
  MockedFunctionView,
  NestedObjectContextProvider,
  NestedObjectTestConfigView,
} from "./NestedObjectTestConfigViews";
import { useEffect, useReducer, useState } from "react";
import { TestCaseServices } from "../services";
import { HorizontalFlowDiagram } from "../../../components/FlowChart/HorizontalFlowDiagram.tsx";
import { PyramidFlowDiagram } from "../../../components/FlowChart/PyramidFlowDiagram";
import { DiagramEntity } from "../../../components/FlowChart/types.ts";

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
  const [state, setState] = useReducer(
    (p: any, c: any) => ({ ...p, ...c }),
    {}
  ) as any as [
    Partial<TestCaseForFunction>,
    (s: Partial<TestCaseForFunction>) => void
  ];

  const [internalState, setInternalState] = useReducer(
    (p: any, c: any) => ({ ...p, ...c }),
    {}
  );

  const [mockedFunctions, setMockedFunctions] = useState<FunctionTestConfig[]>(
    []
  );

  const [columns, setColumns] = useState<NestedObjectColumnItem[][]>([]);

  useEffect(() => {
    setState({ ...functionTestConfig, mocks: functionTestConfig.mocks || {} });
    const mockedFunctions: FunctionTestConfig[] = [];
    visit(
      functionTestConfig.config,
      (f) => {
        if (f.isMocked) {
          mockedFunctions.push(f);
        }
      },
      (f) => f.children
    );
    setMockedFunctions(mockedFunctions);
  }, [functionTestConfig]);

  useEffect(() => {
    if (state.config) {
      setColumns(getColumns(state.config, [state.config.functionMeta.name]));
    }
  }, [state.config]);

  useEffect(() => {
    if (state && Object.keys(state).length) {
      Object.keys(state).forEach((k) => {
        (functionTestConfig as any)[k] = (state as any)[k];
      });
    }
  }, [state]);

  const mockFunction = (f: FunctionTestConfig) => {
    if (!functionTestConfig.mocks) {
      functionTestConfig.mocks = {};
    }
    const key = `${f.functionMeta.moduleName}:${f.functionMeta.name}`;
    if (!functionTestConfig.mocks![key]) {
      functionTestConfig.mocks![key] = {};
    }
    functionTestConfig.mocks![key][f.functionCallCount] = {
      output: f.functionMeta.output,
      errorToThrow: f.functionMeta.error,
    };
    setMockedFunctions([...mockedFunctions, f]);
    setState({
      mocks: {
        ...functionTestConfig.mocks,
      },
    });
  };

  const unMockFunction = (f: FunctionTestConfig) => {
    if (!functionTestConfig.mocks) {
      functionTestConfig.mocks = {};
    }
    const key = `${f.functionMeta.moduleName}:${f.functionMeta.name}`;
    delete functionTestConfig.mocks![key]?.[f.functionCallCount];
    setState({
      mocks: {
        ...functionTestConfig.mocks,
      },
    });
    const mockedFunctionIndex = mockedFunctions.findIndex(
      (mf) => f.functionMeta.id === mf.functionMeta.id
    );
    mockedFunctions.splice(mockedFunctionIndex, 1);
    setMockedFunctions([...mockedFunctions]);

    // setColumns(
    //   getColumns(state.config!, getObjectPathFromCurrentColumns(columns))
    // );
  };
  if (!functionTestConfig.config) {
    return null;
  }

  return (
    <>
      <TextField
        value={state.name}
        fullWidth
        label="Test Case Name"
        onChange={(e) => {
          setState({ name: e.target.value });
        }}
        sx={{ my: 3 }}
      />
      <Grid
        width={"100%"}
        display={"flex"}
        alignItems={"center"}
        sx={{ my: 1 }}
      >
        <TextField
          value={JSON.stringify(state.inputToPass)}
          sx={{ flexGrow: 1 }}
          onChange={(e) => {
            try {
              const object = JSON.parse(e.target.value);
              setState({ inputToPass: object });
              setInternalState({ inputToPassError: false });
            } catch (e) {
              setInternalState({ inputToPassError: true });
            }
          }}
          multiline
          error={internalState?.inputToPassError}
          label="Input to pass to the function for this test"
        />
        <Button
          onClick={() => {
            TestCaseServices.runFunctionWithInput(
              functionTestConfig.config.functionMeta,
              state.inputToPass
            ).then((res) => {
              setState({
                config: getFunctionTestConfigForExecutedFunction(
                  res.executedFunction,
                  true
                ),
              });
              console.log(res);
            });
          }}
        >
          Run Function with This Input
        </Button>
      </Grid>
      <NestedObjectContextProvider
        {...{
          mockFunction,
          unMockFunction,
          refreshColumns: () =>
            setColumns(
              getColumns(
                state.config!,
                getObjectPathFromCurrentColumns(columns)
              )
            ),
        }}
      >
        {(Object.keys(state.mocks || {}).length && (
          <Grid
            width={"100%"}
            display={"flex"}
            flexDirection={"column"}
            bgcolor={"lightblue"}
            sx={{ my: 1, p: 1 }}
          >
            <Typography variant="h6" sx={{ textAlign: "left", mb: 2 }}>
              Mocks
            </Typography>
            {!state.mocks && "No mocks configured for this test case."}
            {mockedFunctions.map((f) => {
              return (
                <>
                  <Accordion key={f.functionMeta.id}>
                    <AccordionSummary>
                      ({f.functionCallCount}) {f.functionMeta.name}
                    </AccordionSummary>
                    <AccordionDetails>
                      <MockedFunctionView
                        config={f}
                        onChange={() => undefined}
                      />
                    </AccordionDetails>
                  </Accordion>
                </>
              );
            })}
          </Grid>
        )) ||
          null}
        <Grid container>
          <Grid item xs={12}>
            <TestConfigViews config={functionTestConfig.config} />
          </Grid>
        </Grid>
      </NestedObjectContextProvider>
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


export const TestSuiteMetaData: React.FC<{ testSuite: TestSuiteForFunction }> = ({
  testSuite,
}) => {
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