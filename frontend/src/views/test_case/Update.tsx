import { useEffect } from "react";
import {
  TestConfig,
  TestConfigForFunctionJSON,
} from "../../components/TestRun/TestRunView";
import { useGeneralState } from "../../helpers/useGeneralState";
import { TestCaseService } from "../../services/base";
import {
  convertFunctionConfigToJSON,
  convertJSONConfigToTestCaseConfig,
} from "../../helpers/function";
import { TestCreateView } from "../../components/TestCreate/TestCreateView";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export const UpdateTestView: React.FC<any> = () => {
  const params = useParams();

  const [state, setState] = useGeneralState<{
    config: TestConfig;
    loading: boolean;
    id?: string;
  }>({
    loading: true,
  });

  const id = params?.["*"];

  useEffect(() => {
    if (!id) {
      return;
    }
    setState({ loading: true });
    new TestCaseService().retrieve(id).then((res) => {
      setState({
        config: {
          ...res!,
          testCases:
            res?.config?.map((c) =>
              convertJSONConfigToTestCaseConfig(c as any)
            ) || [],
        },
        loading: false,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = () => {
    const { config } = state;
    setState({ loading: true });
    new TestCaseService()
      .put({
        id: config.id,
        name: config.name,
        description: config.description,
        config:
          config.testCases.map(
            (c): TestConfigForFunctionJSON => convertFunctionConfigToJSON(c)
          ) || [],
      })
      .then((res) => {
        setState({
          config: {
            ...res!,
            testCases:
              res?.config?.map((c) =>
                convertJSONConfigToTestCaseConfig(c as any)
              ) || [],
          },
          loading: false,
        });
      });
  };

  if (!state.config) {
    return <CircularProgress />;
  }
  return (
    <>
      <Box display={"flex"} flexDirection={"column"} alignItems={"flex-start"}>
        <Typography sx={{ mb: 5, mt: 1 }} variant="h4">
          Test Case
        </Typography>
        <TestCreateView
          config={state.config}
          onChange={(config) => setState({ config })}
        />
        <Button variant="outlined" color="primary" onClick={onSave}>
          Save Test Case
        </Button>
      </Box>
    </>
  );
};
