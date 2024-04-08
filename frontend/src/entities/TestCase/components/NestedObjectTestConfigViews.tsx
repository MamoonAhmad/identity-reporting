import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";
import {
  FunctionTestConfig,
  ObjectTestConfig,
} from "../../../components/NestedObjectView/someutil";
import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from "react";

const NestedObjectContext = React.createContext<{
  mockFunction: (o: FunctionTestConfig) => void;
  unMockFunction: (o: FunctionTestConfig) => void;
}>({} as any);

export const NestedObjectContextProvider: React.FC<
  PropsWithChildren<{
    mockFunction: (o: FunctionTestConfig) => void;
    unMockFunction: (o: FunctionTestConfig) => void;
  }>
> = ({ children, mockFunction, unMockFunction }) => {
  return (
    <NestedObjectContext.Provider value={{ mockFunction, unMockFunction }}>
      {children}
    </NestedObjectContext.Provider>
  );
};

export const NestedObjectTestConfigView: React.FC<{
  object: any;
}> = ({ object }) => {
  return (
    <>
      {object.object._type === "FunctionTestConfig" && (
        <FunctionConfigView config={object.object} name={object.name} />
      )}{" "}
      {object.object._type === "ObjectTestConfig" && (
        <ObjectConfigView config={object.object} name={object.name} />
      )}
    </>
  );
};

const FunctionConfigView: React.FC<{
  config: FunctionTestConfig;
  name: string;
}> = ({ config, name }) => {
  const [state, setState] = useReducer((p: any, c: any) => ({ ...p, ...c }), {
    ...config,
  }) as [FunctionTestConfig, (c: Partial<FunctionTestConfig>) => void];

  const { mockFunction, unMockFunction } = useContext(NestedObjectContext);

  useEffect(() => {
    const a: any = config;
    const b: any = state;
    Object.keys(state).forEach((k) => {
      if (a[k] !== b[k]) {
        a[k] = b[k];
      }
    });
  }, [state]);

  useEffect(() => {
    console.log("Changed", config);
    setState({ ...config });
  }, [config]);

  return (
    <Grid container>
      <Grid item xs={12} display={"flex"} alignItems={"center"}>
        <Typography variant="h6">{name}</Typography>
      </Grid>

      {state.isMocked && (
        <>
          <Grid item xs={12} display={"flex"} alignItems={"center"}>
            <Button
              onClick={() => {
                setState({
                  isMocked: false,
                  mockedOutput: undefined,
                  mockedErrorMessage: undefined,
                });
                unMockFunction(state);
              }}
            >
              UnMock This Function
            </Button>
          </Grid>
        </>
      )}
      {!state.isMocked && (
        <>
          <Grid item xs={12} display={"flex"} alignItems={"center"}>
            <Button
              onClick={() => {
                setState({
                  isMocked: true,
                  mockedOutput: state.functionMeta.output,
                  mockedErrorMessage: state.functionMeta?.error,
                });
                mockFunction(state);
              }}
            >
              Mock This Function
            </Button>
          </Grid>
          <Grid item xs={12} display={"flex"} alignItems={"center"}>
            <CheckboxWithLabel
              label="Ignore Child Function Calls"
              name="ignoreChildren"
              value={!!state.ignoreChildren}
              onChange={setState}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};

const ObjectConfigView: React.FC<{
  config: ObjectTestConfig;
  name: string;
}> = ({ config, name }) => {
  const [state, setState] = useReducer((p: any, c: any) => ({ ...p, ...c }), {
    ...config,
  }) as [ObjectTestConfig, (c: Partial<ObjectTestConfig>) => void];

  useEffect(() => {
    const a: any = config;
    const b: any = state;
    Object.keys(state).forEach((k) => {
      if (a[k] !== b[k]) {
        a[k] = b[k];
      }
    });
  }, [state]);

  useEffect(() => {
    setState({ ...config });
  }, [config]);

  return (
    <Grid container>
      <Grid item xs={12} display={"flex"} alignItems={"center"}>
        <Typography variant="h6">{name}</Typography>
      </Grid>
      <Grid item xs={12} display={"flex"} alignItems={"center"}>
        <CheckboxWithLabel
          label="Ignore"
          name="ignore"
          value={!!state.ignore}
          onChange={setState}
        />
      </Grid>
    </Grid>
  );
};

const CheckboxWithLabel: React.FC<{
  value: boolean;
  onChange: (v: { [key: string]: boolean }) => void;
  label: string;
  name: string;
}> = ({ value, onChange, label, name }) => (
  <FormControlLabel
    control={<Checkbox checked={value} />}
    onChange={(_, checked) => {
      onChange({ [name]: checked });
    }}
    label={label}
  />
);
