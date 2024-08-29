import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React, {
  PropsWithChildren,
  useCallback,
  useState,
} from "react";
import { JSONTextField } from "../../../components/JSONTestField";
import {
  AddSharp,
  DeleteSharp,
  KeyboardArrowDownSharp,
} from "@mui/icons-material";
import { CodeTestField } from "../../../components/CodeTestField";
import { Box } from "@mui/system";
import { useObjectChange } from "./useObjectChange";
import { FunctionTestConfig, FunctionTestConfigAssertion } from "../types";

const NestedObjectContext = React.createContext<{
  mockFunction: (o: FunctionTestConfig) => void;
  unMockFunction: (o: FunctionTestConfig) => void;
  refreshColumns: () => void;
  onConfigUpdate: () => void;
  changeRequester: string | undefined;
  setChangeRequester: (requester: string | undefined) => void;
}>({} as any);

export const NestedObjectContextProvider: React.FC<
  PropsWithChildren<{
    mockFunction: (o: FunctionTestConfig) => void;
    unMockFunction: (o: FunctionTestConfig) => void;
    refreshColumns: () => void;
  }>
> = ({ children, mockFunction, unMockFunction, refreshColumns }) => {
  const [counter, updateCounter] = useState(0);
  const [changeRequester, setChangeRequester] = useState<string | undefined>();
  return (
    <NestedObjectContext.Provider
      value={{
        mockFunction,
        unMockFunction,
        refreshColumns,
        onConfigUpdate: () => updateCounter(counter + 1),
        changeRequester,
        setChangeRequester,
      }}
    >
      {children}
    </NestedObjectContext.Provider>
  );
};

export const NestedObjectTestConfigView: React.FC<{
  object: any;
}> = ({ object }) => {
  return (
    <>
      <FunctionConfigView config={object.object} name={object.name} />
    </>
  );
};

const FunctionConfigView: React.FC<{
  config: FunctionTestConfig;
  name: string;
}> = ({ config, name }) => {
  const updateState = useObjectChange(config);

  const deleteAssertion = useCallback(
    (assertion: FunctionTestConfigAssertion) => {
      const index = config.assertions.findIndex((a) => assertion === a);
      if (index > -1) {
        config.assertions.splice(index, 1);
      }
      updateState({ assertions: [...config.assertions] });
    },
    [config]
  );
  return (
    <Grid container>
      <Grid item xs={12} display={"flex"} alignItems={"center"}>
        <Typography variant="h6">{name}</Typography>
      </Grid>

      {config.isMocked && (
        <MockedFunctionView config={config} onChange={() => undefined} />
      )}
      {!config.isMocked && (
        <>
          <Grid item xs={12} display={"flex"} alignItems={"center"}>
            <Button
              onClick={() => {
                updateState({
                  isMocked: true,
                  mockedOutput: config.functionMeta?.output,
                  mockedErrorMessage: config.functionMeta?.error,
                });
              }}
            >
              Mock This Function
            </Button>
          </Grid>

          <Grid
            item
            xs={12}
            display={"flex"}
            alignItems={"center"}
            sx={{ my: 1, position: "sticky" }}
          >
            <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "left" }}>
              Assertions
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {config.assertions.map((a) => (
              <AssertionView
                assertion={a}
                onDelete={deleteAssertion}
                config={config}
              />
            ))}

            <Button
              variant="text"
              sx={{ my: 2 }}
              onClick={() => {
                updateState({
                  assertions: [...config.assertions, getNewAssertion(config)],
                });
              }}
            >
              <AddSharp />
              Add New Assertion For This Function
            </Button>
          </Grid>
        </>
      )}
    </Grid>
  );
};

const AssertionView: React.FC<{
  assertion: FunctionTestConfigAssertion;
  onDelete: (assertion: FunctionTestConfigAssertion) => void;
  config: FunctionTestConfig;
}> = ({ assertion, onDelete, config }) => {
  const updateState = useObjectChange(assertion);

  const _ = useObjectChange(config, (obj) => [
    obj.functionMeta.input,
    obj.functionMeta.input,
  ]);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<KeyboardArrowDownSharp />}
        sx={{ flexDirection: "row-reverse" }}
      >
        <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
          <Typography variant="body2" sx={{ flexGrow: 1, textAlign: "left" }}>
            {assertion.name}
          </Typography>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(assertion);
            }}
          >
            <DeleteSharp fontSize="small" />
          </IconButton>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid
          item
          xs={12}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"flex-start"}
        >
          <FormControlLabel
            control={<Switch />}
            label="Custom Validator"
            value={!!assertion.customValidator}
            onChange={(_, checked) => {
              updateState({
                customValidator: checked
                  ? {
                      code: "",
                    }
                  : undefined,
              });
            }}
          />
          {assertion.shouldThrowError && !assertion.customValidator && (
            <>
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                Operator
              </Typography>

              <ToggleButtonGroup
                value={assertion.expectedErrorMessage?.operator}
                sx={{ mb: 1 }}
                color="primary"
                onChange={(_, op) => {
                  updateState({
                    expectedErrorMessage: {
                      ...assertion.expectedErrorMessage!,
                      operator: op,
                    },
                  });
                }}
                exclusive
              >
                <ToggleButton
                  value={"equals"}
                  sx={{ textTransform: "capitalize", p: 0.8 }}
                >
                  Equals
                </ToggleButton>
                <ToggleButton
                  value={"contains"}
                  sx={{ textTransform: "capitalize", p: 0.8 }}
                >
                  Contains
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                Expected Error Message
              </Typography>
              <TextField
                value={assertion.expectedErrorMessage?.message}
                fullWidth
                label="Expected Error Message"
                onChange={(e) => {
                  updateState({
                    expectedErrorMessage: {
                      ...assertion.expectedErrorMessage!,
                      message: e.target.value,
                    },
                  });
                }}
                sx={{ my: 1 }}
                multiline
              />
            </>
          )}
          {!assertion.shouldThrowError && !assertion.customValidator && (
            <>
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                Name
              </Typography>
              <TextField
                value={assertion.name}
                fullWidth
                onChange={(e) => {
                  updateState({ name: e.target.value });
                }}
                sx={{ mb: 1 }}
              />
              <Grid
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <Grid
                  xs={6}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    Target Object
                  </Typography>

                  <ToggleButtonGroup
                    value={assertion.ioConfig?.target}
                    color="primary"
                    onChange={(_, op) => {
                      if (op === null) {
                        return;
                      }
                      updateState({
                        ioConfig: {
                          ...assertion.ioConfig!,
                          target: op,
                          object:
                            op === "input"
                              ? config.functionMeta.input
                              : config.functionMeta.output,
                        },
                      });
                    }}
                    exclusive
                  >
                    <ToggleButton
                      value={"input"}
                      sx={{ textTransform: "capitalize", p: 0.8 }}
                      disabled={config.isRootFunction}
                    >
                      Input
                    </ToggleButton>
                    <ToggleButton
                      value={"output"}
                      sx={{ textTransform: "capitalize", p: 0.8 }}
                    >
                      Output
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid
                  sx={{
                    display: "flex",
                    flexGrow: 1,
                    alignItems: "flex-start",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    Operator
                  </Typography>

                  <ToggleButtonGroup
                    value={assertion.ioConfig?.operator}
                    color="primary"
                    onChange={(_, op) => {
                      if (op === null) {
                        return;
                      }
                      assertion.ioConfig!.operator = op;
                      updateState({});
                    }}
                    exclusive
                  >
                    <ToggleButton
                      value={"equals"}
                      sx={{ textTransform: "capitalize", p: 0.8 }}
                    >
                      Equals
                    </ToggleButton>
                    <ToggleButton
                      value={"contains"}
                      sx={{ textTransform: "capitalize", p: 0.8 }}
                    >
                      Contains
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>

              <Typography variant="body2" sx={{ fontWeight: "bold", my: 1 }}>
                Expected {assertion.ioConfig!.target}
              </Typography>
              <JSONTextField
                object={assertion.ioConfig?.object}
                onChange={(obj) => {
                  assertion.ioConfig!.object = obj;
                  updateState({});
                }}
              />
            </>
          )}
          {assertion.customValidator && (
            <>
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                Validation Code
              </Typography>
              <CodeTestField
                code={assertion.customValidator.code}
                onChange={(code) => {
                  assertion.customValidator!.code = code;
                  updateState({});
                }}
              />
            </>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

const getNewAssertion = (
  config: FunctionTestConfig,
  assert: Partial<FunctionTestConfigAssertion> = {}
): FunctionTestConfigAssertion => {
  if (config.shouldThrowError) {
    return {
      name: "New Assertion",
      shouldThrowError: true,
      customValidator: undefined,
      expectedErrorMessage: {
        operator: "equals",
        message: config.functionMeta.error!,
      },
      ...assert,
    };
  }
  return {
    name: "New Assertion",
    shouldThrowError: false,
    customValidator: undefined,
    expectedErrorMessage: undefined,
    ioConfig: {
      object: config.functionMeta.output,
      target: "output",
      operator: "equals",
    },
    ...assert,
  };
};

export const MockedFunctionView: React.FC<{
  config: FunctionTestConfig;
  onChange: (c: FunctionTestConfig) => void;
}> = ({ config }) => {
  const updateState = useObjectChange(config);


  return (
    <>
      <Grid
        item
        xs={12}
        display={"flex"}
        alignItems={"flex-start"}
        flexDirection={"column"}
      >
        <Button
          onClick={() => {
            updateState({
              isMocked: false,
              mockedOutput: undefined,
              mockedErrorMessage: undefined,
            });
          }}
        >
          UnMock This Function
        </Button>

        {config.functionMeta.error ? (
          <>
            <Typography variant="body2" sx={{ fontWeight: "bold", my: 1 }}>
              Mocked Error
            </Typography>
            <TextField
              fullWidth
              value={config.mockedErrorMessage}
              onChange={(e) => {
                updateState({
                  mockedErrorMessage: e.target.value,
                });
              }}
            />
          </>
        ) : (
          <>
            <Typography variant="body2" sx={{ fontWeight: "bold", my: 1 }}>
              Mocked Output
            </Typography>
            <JSONTextField
              object={config.mockedOutput}
              onChange={(obj) => {
                updateState({ mockedOutput: obj });
              }}
            />
          </>
        )}
      </Grid>
    </>
  );
};

// const Wrapper = function <T>(
//   component: React.FC<T & { onObjectUpdate: () => void }>
// ) {
//   return React.memo((props: Omit<T, "onObjectUpdate">) => {
//     const [counter, setCounter] = useState({});
//   });
// };

// const Some = Wrapper(
//   (props: { onObjectUpdate: () => void; some: string; bob: string }) => {}
// );
