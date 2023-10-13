import React, { PropsWithChildren, useEffect } from "react";
import { ExecutedFunction1Type } from "../../ExecutionFunction";
import { useGeneralState } from "../../helpers/useGeneralState";
import { createExecutedFunctions } from "../../helpers/function";
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
  Typography,
} from "@mui/material";
import logs from "../../tests/data/logs1.json";
import { useNavigate } from "react-router-dom";
import { TestValidator } from "../../validators/test";
import { FunctionValidator } from "../../validators/function";

const functions = createExecutedFunctions(logs as any);

export const CreateTestView: React.FC<any> = () => {
  const navigate = useNavigate();

  const [state, setState] = useGeneralState<{
    config: TestValidator;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = () => {
    const { config } = state;
    setState({ loading: true });
    new TestCaseService().post(config.json()).then((res) => {
      setState({
        config: TestValidator.initializeFromJSON(res!),
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
              disabled={!!state?.config?.config.id || !state.config.config.name}
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

          const config = new TestValidator({
            name: "",
            description: "",
            id: null as any,
            functions: state.executedFunctions
              .filter((f) => f.selected)
              .map((f) =>
                FunctionValidator.initializeFromExecutedFunction(f.function)
              ),
          });

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
