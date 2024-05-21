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
import {
  FunctionTestConfig,
  FunctionTestConfigAssertion,
} from "../../../components/NestedObjectView/someutil";
import React, { PropsWithChildren, useContext, useState } from "react";
import { JSONTextField } from "../../../components/JSONTestField";
import {
  AddSharp,
  DeleteSharp,
  KeyboardArrowDownSharp,
} from "@mui/icons-material";
import { CodeTestField } from "../../../components/CodeTestField";
import { Box } from "@mui/system";

const NestedObjectContext = React.createContext<{
  mockFunction: (o: FunctionTestConfig) => void;
  unMockFunction: (o: FunctionTestConfig) => void;
  refreshColumns: () => void;
  onConfigUpdate: () => void;
}>({} as any);

export const NestedObjectContextProvider: React.FC<
  PropsWithChildren<{
    mockFunction: (o: FunctionTestConfig) => void;
    unMockFunction: (o: FunctionTestConfig) => void;
    refreshColumns: () => void;
  }>
> = ({ children, mockFunction, unMockFunction, refreshColumns }) => {
  const [counter, updateCounter] = useState(0);
  return (
    <NestedObjectContext.Provider
      value={{
        mockFunction,
        unMockFunction,
        refreshColumns,
        onConfigUpdate: () => updateCounter(counter + 1),
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
  const { mockFunction, onConfigUpdate } = useContext(NestedObjectContext);

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
                config.isMocked = true;
                config.mockedOutput = config.functionMeta.output;
                config.mockedErrorMessage = config.functionMeta?.error;
                mockFunction({
                  ...config,
                  isMocked: true,
                  mockedOutput: config.functionMeta.output,
                  mockedErrorMessage: config.functionMeta?.error,
                });
                onConfigUpdate();
              }}
            >
              Mock This Function
            </Button>
          </Grid>
          {/* <Grid item xs={12} display={"flex"} alignItems={"center"}>
            <CheckboxWithLabel
              label="Ignore Child Function Calls"
              name="ignoreChildren"
              value={!!state.ignoreChildren}
              onChange={setState}
            />
          </Grid> */}
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
              <AssertionView assertion={a} config={config} />
            ))}

            <Button
              variant="text"
              sx={{ my: 2 }}
              onClick={() => {
                config.assertions = [
                  ...config.assertions,
                  getNewAssertion(config),
                ];
                onConfigUpdate();
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
  config: FunctionTestConfig;
}> = ({ assertion, config }) => {
  const { onConfigUpdate } = useContext(NestedObjectContext);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<KeyboardArrowDownSharp />}
        sx={{ flexDirection: "row-reverse" }}
      >
        <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {assertion.name}
          </Typography>
          <IconButton
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              const index = config.assertions.findIndex((a) => a === assertion);
              config.assertions.splice(index, 1);
              onConfigUpdate();
            }}
          >
            <DeleteSharp />
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
              assertion.customValidator = checked
                ? {
                    code: "",
                  }
                : undefined;
              onConfigUpdate();
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
                  assertion.expectedErrorMessage = {
                    ...assertion.expectedErrorMessage!,
                    operator: op,
                  };
                  onConfigUpdate();
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
                  assertion.expectedErrorMessage = {
                    ...assertion.expectedErrorMessage!,
                    message: e.target.value,
                  };
                  onConfigUpdate();
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
                  assertion.name = e.target.value;
                  onConfigUpdate();
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
                      assertion.ioConfig = {
                        ...assertion.ioConfig!,
                        target: op,
                        object:
                          op === "input"
                            ? config.functionMeta.input
                            : config.functionMeta.output,
                      };
                      onConfigUpdate();
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
                      onConfigUpdate();
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
                  onConfigUpdate();
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
                  onConfigUpdate();
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
  const { unMockFunction, onConfigUpdate } = useContext(NestedObjectContext);

  console.log("Updated mocked view", config.mockedOutput);

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
            config.isMocked = false;
            config.mockedOutput = undefined;
            config.mockedErrorMessage = undefined;
            unMockFunction(config);
            onConfigUpdate();
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
                config.mockedErrorMessage = e.target.value;
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
                config.mockedOutput = obj;
                onConfigUpdate();
              }}
            />
          </>
        )}
      </Grid>
    </>
  );
};
