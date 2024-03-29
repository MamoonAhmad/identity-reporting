import { Button, Grid, TextField, Typography } from "@mui/material";
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
import { AddSharp, KeyboardArrowRightSharp } from "@mui/icons-material";
import { NestedObjectTestConfigView } from "./NestedObjectTestConfigViews";
import { useEffect, useReducer, useState } from "react";
import axios from "axios";

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
  config: FunctionTestConfig;
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
        {state.tests?.map((t) => (
          <TestConfigColumns object={t} />
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

const TestConfigColumns: React.FC<{ object: TestCaseForFunction }> = ({
  object: functionTestConfig,
}) => {
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
    setState({ ...functionTestConfig });
    if (functionTestConfig.config) {
      setColumns(
        getColumns(functionTestConfig.config, [
          functionTestConfig.config.functionMeta.name,
        ])
      );
    }
  }, [functionTestConfig]);

  useEffect(() => {
    if (state && Object.keys(state).length) {
      Object.keys(state).forEach((k) => {
        (functionTestConfig as any)[k] = (state as any)[k];
      });
    }
  }, [state]);

  if (!functionTestConfig.config) {
    return null;
  }

  return (
    <>
      <Typography variant="h5">Expectation: {state.name}</Typography>
      <TextField
        value={state.name}
        fullWidth
        label="What Should This Function Do"
        onChange={(e) => {
          setState({ name: e.target.value });
        }}
        sx={{ my: 3 }}
      />
      <TextField
        value={JSON.stringify(state.inputToPass)}
        fullWidth
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

      <NestedObjectColumns
        objects={columns}
        onObjectSelected={(o) => {
          setColumns(getColumns(functionTestConfig.config, o.objectPath));
        }}
        DetailView={NestedObjectTestConfigView}
        ListItemView={({ object, selectObject }) => {
          return (
            <Button
              sx={{
                width: "100%",
                height: 20,
                backgroundColor: object.selected ? "cyan" : "white",
                color: object.selected ? "white" : "cyan",
                "&:hover": {
                  backgroundColor: "cyan",
                  color: "white",
                },
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
              {hasChildren(object.object) ? <KeyboardArrowRightSharp /> : ""}
            </Button>
          );
        }}
      />
    </>
  );
};
