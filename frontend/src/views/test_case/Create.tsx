import React, { PropsWithChildren, useEffect, useState } from "react";
import { ExecutedFunction1Type } from "../../ExecutionFunction";
import {
  TestConfig,
  TestConfigForFunctionJSON,
} from "../../components/TestRun/TestRunView";
import { useGeneralState } from "../../helpers/useGeneralState";
import {
  convertFunctionConfigToJSON,
  convertJSONConfigToTestCaseConfig,
  createExecutedFunctions,
  createTestConfigFromExecutedFunctions,
} from "../../helpers/function";
import { TestCaseService } from "../../services/base";
import { TestCreateView } from "../../components/TestCreate/TestCreateView";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import logs from "../../tests/data/logs1.json";
import { CheckBox } from "@mui/icons-material";
import { redirect, useNavigate } from "react-router-dom";

const functions = createExecutedFunctions(logs as any);

export const CreateTestView: React.FC<any> = (props) => {
  const navigate = useNavigate();

  const [state, setState] = useGeneralState<{
    config: TestConfig;
    loading: boolean;
    executedFunctions: { selected: boolean; function: ExecutedFunction1Type }[];
  }>({
    loading: false,
    executedFunctions: [],
  });

  useEffect(() => {
    (async () => {
      const functions = await getRecentlyExecutedFunctions();

      setState({
        executedFunctions: functions.map((f) => ({
          selected: false,
          function: f,
        })),
      });
    })();
  }, []);

  const onCreate = () => {
    const { config } = state;
    setState({ loading: true });
    new TestCaseService()
      .post({
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
        navigate(`/test_case/${res!.id}`);
      });
  };

  if (!state.executedFunctions.length) {
    return <CircularProgress size={50} />;
  }
  return (
    <>
      {state.config && (
        <>
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"flex-start"}
          >
            <Typography sx={{ mb: 5, mt: 1 }} variant="h4">
              Create Test Case
            </Typography>
            <TestCreateView
              config={state.config}
              onChange={(config) => setState({ config })}
            />
            <Button
              sx={{ mt: 10 }}
              disabled={!!state?.config?.id}
              variant="outlined"
              color="primary"
              onClick={onCreate}
            >
              Create Test Case
            </Button>
          </Box>
        </>
      )}

      <ConfirmationDialogRaw
        open={!state.config}
        title="Select Function(s)"
        onClose={(confirm) => {
          if (!confirm) return;

          const config = createTestConfigFromExecutedFunctions(
            state.executedFunctions
              .filter((f) => f.selected)
              .map((f) => f.function)
          );

          setState({ config });
        }}
      >
        <Typography variant="body1">Select one or more functions.</Typography>
        <List>
          {state.executedFunctions.map((f, i) => (
            <ListItem disablePadding>
              <ListItemButton
                dense
                onClick={() => {
                  const value = state.executedFunctions[i].selected;
                  state.executedFunctions[i] = {
                    ...state.executedFunctions[i],
                    selected: !value,
                  };
                  setState({ executedFunctions: [...state.executedFunctions] });
                }}
              >
                <ListItemIcon>
                  <Checkbox checked={f.selected} />
                </ListItemIcon>
                <ListItemText
                  primary={f.function.name}
                  secondary={f.function.description}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </ConfirmationDialogRaw>
    </>
  );
};

export interface ConfirmationDialogRawProps {
  keepMounted?: boolean;
  open: boolean;
  onClose: (confirm: boolean) => void;
  title: string;
}

function ConfirmationDialogRaw(
  props: PropsWithChildren<ConfirmationDialogRawProps>
) {
  const { onClose, open, title, children, ...other } = props;

  const handleCancel = () => {
    onClose(false);
  };

  const handleOk = () => {
    onClose(true);
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      // TransitionProps={{ onEntering: handleEntering }}
      open={open}
      {...other}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

async function getRecentlyExecutedFunctions(): Promise<
  ExecutedFunction1Type[]
> {
  return [
    ...functions,
    ...functions,
    ...functions,
    ...functions,
    ...functions,
    ...functions,
    ...functions,
    ...functions,
    ...functions,
    ...functions,
    ...functions,
    ...functions,
    ...functions,
    ...functions,
    ...functions,
  ];
}
