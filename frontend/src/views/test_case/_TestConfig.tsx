import { Button, Grid, TextField, Typography } from "@mui/material";
import {
  NestedObjectColumnItem,
  NestedObjectColumns,
} from "../../components/NestedObjectView/NestedObjectView";
import {
  ExecutedFunction,
  FunctionTestConfig,
  ObjectTestConfig,
  getColumns,
  hasChildren,
} from "../../components/NestedObjectView/someutil";
import { KeyboardArrowRightSharp } from "@mui/icons-material";
import { NestedObjectTestConfigView } from "./_NestedObjectTestConfigViews";
import { useEffect, useReducer, useState } from "react";
import axios from "axios";

export type TestCase = {
  _id: string;
  name: string;
  description: string;
  functionMeta: ExecutedFunction;
  inputToPass: any;
  config: FunctionTestConfig;
};

export const ConfigureTestCase: React.FC<{
  testCase: TestCase;
  onSave?: (testCase: TestCase) => void;
}> = ({ testCase, onSave }) => {
  const [state, setState] = useReducer((p: any, c: any) => ({ ...p, ...c }), {
    name: "",
    id: undefined,
    description: "",
    config: null,
  });

  useEffect(() => {
    setState({ ...testCase });
  }, [testCase]);

  return (
    <>
      <Grid
        container
        display="flex"
        alignItems={"stretch"}
        flexDirection={"column"}
      >
        <TextField
          value={state.name}
          label="Test Case Name"
          onChange={(e) => {
            setState({ name: e.target.value });
          }}
          sx={{ my: 3 }}
        />
        <TextField
          value={state.description}
          label="Test Case Description"
          onChange={(e) => {
            setState({ description: e.target.value });
          }}
          sx={{ my: 3 }}
        />
        <Typography variant="h5" textAlign={"left"} sx={{ my: 3 }}>
          Test Case Configuration
        </Typography>
        {state.config && <TestConfigColumns object={state} />}
        <Button
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

const TestConfigColumns: React.FC<{ object: TestCase }> = ({
  object: functionTestConfig,
}) => {
  const [columns, setColumns] = useState<NestedObjectColumnItem[][]>(
    getColumns(functionTestConfig.config, [
      functionTestConfig.functionMeta.name,
    ])
  );
  return (
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
            <Typography variant="body1" sx={{ flexGrow: 1, textAlign: "left" }}>
              {object.name}
            </Typography>
            {hasChildren(object.object) ? <KeyboardArrowRightSharp /> : ""}
          </Button>
        );
      }}
    />
  );
};
