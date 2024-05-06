import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  IconButton,
  List,
  ListItemButton,
  MenuItem,
  Modal,
  Select,
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
  FunctionTestConfigAssertion,
  getColumns,
  getFunctionTestConfigForExecutedFunction,
  hasChildren,
} from "../../../components/NestedObjectView/someutil";
import {
  AddSharp,
  ArrowUpward,
  CloseSharp,
  DeleteSharp,
  KeyboardArrowDown,
  KeyboardArrowDownSharp,
  KeyboardArrowRightSharp,
} from "@mui/icons-material";
import {
  MockedFunctionView,
  NestedObjectContextProvider,
  NestedObjectTestConfigView,
} from "./NestedObjectTestConfigViews";
import { useEffect, useMemo, useReducer, useState } from "react";
import axios from "axios";
import { TestCaseServices } from "../services";
import { JSONTextField } from "../../../components/JSONTestField";
import { HorizontalFlowDiagram } from "../../../components/FlowChart/HorizentalFlowDiagram";
import { PyramidFlowDiagram } from "../../../components/FlowChart/PyramidFlowDiagram";
import { DiagramEntity } from "../../../components/FlowChart/types";

export type TestSuiteForFunction = {
  _id: string;
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

export const ConfigureTestCase: React.FC<{
  testCase: TestSuiteForFunction;
  onSave?: (testCase: TestSuiteForFunction) => void;
}> = ({ testCase, onSave }) => {
  const [state, setState] = useReducer(
    (p: any, c: any) => ({ ...p, ...c }),
    {}
  ) as any as [
    Partial<TestSuiteForFunction>,
    (s: Partial<TestSuiteForFunction>) => void
  ];

  useEffect(() => {
    setState({ ...testCase });
  }, [testCase]);

  useEffect(() => {
    if (state && Object.keys(state).length) {
      Object.keys(state).forEach((k) => {
        (testCase as any)[k] = (state as any)[k];
      });
    }
  }, [state]);

  return (
    <>
      <Grid
        container
        display="flex"
        flexDirection={"column"}
        alignItems={"flex-start"}
      >
        <TextField
          value={state.name}
          fullWidth
          label="Test Case Name"
          onChange={(e) => {
            setState({ name: e.target.value });
          }}
          sx={{ my: 3 }}
        />
        <TextField
          value={state.description}
          fullWidth
          label="Test Case Description"
          onChange={(e) => {
            setState({ description: e.target.value });
          }}
          sx={{ my: 3 }}
        />
        <Typography variant="h5" textAlign={"left"} sx={{ my: 3 }}>
          Test Case Configurations
        </Typography>
        <List></List>
        {state.tests?.map((t, i) => (
          <TestConfigColumns
            object={t}
            key={t.id}
            onDelete={() => {
              state.tests?.splice(i, 1);
              setState({
                tests: [...state.tests!],
              });
            }}
          />
        ))}

        <Button
          onClick={() => {
            setState({
              tests: [
                ...(state?.tests || []),
                {
                  config: getFunctionTestConfigForExecutedFunction(
                    testCase.functionMeta,
                    true
                  ),
                  mocks: {},
                  inputToPass: testCase.functionMeta.input,
                  name: testCase.functionMeta.name,
                  id: new Date().getTime().toString(),
                },
              ],
            });
          }}
        >
          <AddSharp /> Add Test Case
        </Button>

        <Button
          fullWidth
          sx={{ p: 2, my: 3 }}
          color="primary"
          variant="contained"
          onClick={() => {
            axios
              .post("http://localhost:8002/save-test-case", { ...state })
              .then((res) => {
                onSave?.(res.data);
              });
          }}
        >
          Save
        </Button>
      </Grid>
    </>
  );
};

const TestConfigColumns: React.FC<{
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

  const [columns, setColumns] = useState<NestedObjectColumnItem[][]>([]);

  useEffect(() => {
    setState({ ...functionTestConfig, mocks: functionTestConfig.mocks || {} });
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
    functionTestConfig.mocks![f.functionMeta.name] = f as any;
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
    delete functionTestConfig.mocks![f.functionMeta?.name];
    setState({
      mocks: {
        ...functionTestConfig.mocks,
      },
    });
    // setColumns(
    //   getColumns(state.config!, getObjectPathFromCurrentColumns(columns))
    // );
  };

  const [expanded, setExpanded] = useState(false);
  if (!functionTestConfig.config) {
    return null;
  }

  return (
    <>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary color="primary">
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <KeyboardArrowDownSharp />
            <Typography sx={{ flexGrow: 1, textAlign: "left" }}>
              {state.name}
            </Typography>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <DeleteSharp color="error" />
            </IconButton>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
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
                {Object.keys(state.mocks || {}).map((k) => {
                  return (
                    <>
                      <Accordion key={k}>
                        <AccordionSummary>{k}</AccordionSummary>
                        <AccordionDetails>
                          <MockedFunctionView
                            config={functionTestConfig.mocks![k] as any}
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
        </AccordionDetails>
      </Accordion>
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
    id: func.functionMeta._id,
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
