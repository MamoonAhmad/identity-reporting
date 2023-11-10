import { useEffect } from "react";
import { useGeneralState } from "../../helpers/useGeneralState";
import { TestCaseService } from "../../services/base";
import { createExecutedFunctions } from "../../helpers/function";
import { TestCreateView } from "../../components/TestCreate/TestCreateView";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { PlayArrowSharp } from "@mui/icons-material";
import {
  ExecutedFunction1Type,
  ExecutedFunction1TypeTestConfig,
} from "../../ExecutionFunction";
import logs from "../../tests/data/logs1.json";
import { NestedObjectView } from "../../components/NestedObjectView/NestedObjectView";
import { getChildrenForObject } from "../../components/NestedObjectView/nestedObjectUtils";
import {
  GenericTestDetailRunView,
  TestRunListItemView,
} from "../../components/NestedObjectView/TestRunViews";
import { TestValidator } from "../../validators/test";
const functions = createExecutedFunctions(logs as any);

export const UpdateTestView: React.FC<any> = () => {
  const params = useParams();

  const [state, setState] = useGeneralState<{
    config: TestValidator;
    loading: boolean;
    id?: string;
    saving: boolean;
    runTest: boolean;
    executedFunctions: ExecutedFunction1Type[];
    objectPath: string[];
  }>({
    loading: true,
    runTest: false,
    executedFunctions: [],
    objectPath: [],
  });

  const id = params?.["*"];

  useEffect(() => {
    if (!id) {
      return;
    }
    setState({ loading: true });
    new TestCaseService().retrieve(id).then((res) => {
      setState({
        config: TestValidator.initializeFromJSON(res!),
        loading: false,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (state.runTest && !state.executedFunctions.length) {
      runFunctions(
        state.config.config.functions.map(
          (t) => t.config.targetValue.executedFunctionMeta
        )
      ).then((functions) => {
        setState({ executedFunctions: functions });
      });
    }
  }, [state.runTest, state.config, state.executedFunctions.length, setState]);

  const onSave = () => {
    const { config } = state;
    setState({ saving: true });
    new TestCaseService().put(config.json()).then((res) => {
      setState({
        config: TestValidator.initializeFromJSON(res!),
        saving: false,
      });
    });
  };

  if (!state.config && state.loading) {
    return <CircularProgress />;
  }
  return (
    <>
      <Box display={"flex"} flexDirection={"column"} alignItems={"flex-start"}>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          width={"100%"}
          sx={{ mb: 5 }}
        >
          <Typography sx={{ mt: 1 }} variant="h4">
            Test Case
          </Typography>
          <Button
            sx={{ width: 150 }}
            variant="outlined"
            onClick={() => setState({ runTest: true })}
          >
            <PlayArrowSharp color="success" sx={{ mr: 1 }} />
            Run Test
          </Button>
        </Box>

        <TestCreateView
          config={state.config}
          onChange={(config) => setState({ config })}
        />
        <Button
          variant="outlined"
          color="primary"
          onClick={onSave}
          disabled={state.saving || state.loading}
        >
          {state?.saving ? <CircularProgress /> : "Save Test Case"}
        </Button>
      </Box>

      {state.runTest && (
        <NestedObjectView
          open={state.runTest}
          onClose={() => setState({ runTest: false })}
          objectPath={state.objectPath}
          onObjectPathChange={(o) => setState({ objectPath: [...o] })}
          getChildren={getChildrenForObject}
          ListItemView={TestRunListItemView}
          DetailView={GenericTestDetailRunView}
          title="Configure Test"
          label="some"
          initialObjects={state.config.config.functions.map((f, i) => {
            try {
              f.match(state.executedFunctions[i]);
            } catch (e) {
              console.log(e);
            }
            return {
              id: `function.${i}.${f.config.targetValue.executedFunctionMeta.name}`,
              name: `${f.config.targetValue.executedFunctionMeta.name}`,
              object: f,
              onChange: () => undefined,
            };
          })}
        />
      )}
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function runFunctions(_: ExecutedFunction1TypeTestConfig[]) {
  return functions;
}
