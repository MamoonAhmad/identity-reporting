import { Checkbox, FormControlLabel, Grid, Typography } from "@mui/material";
import {
  FunctionTestConfig,
  ObjectTestConfig,
} from "../../components/NestedObjectView/someutil";
import React, { useEffect, useReducer } from "react";

export const NestedObjectTestConfigView: React.FC<{ object: any }> = ({
  object,
}) => {
  if (object.object._type === "FunctionTestConfig") {
    return <FunctionConfigView config={object.object} name={object.name} />;
  } else if (object.object._type === "ObjectTestConfig") {
    return <ObjectConfigView config={object.object} name={object.name} />;
  }
  return null;
};

const FunctionConfigView: React.FC<{
  config: FunctionTestConfig;
  name: string;
}> = ({ config, name }) => {
  const [state, setState] = useReducer((p: any, c: any) => ({ ...p, ...c }), {
    ...config,
  }) as [FunctionTestConfig, (c: Partial<FunctionTestConfig>) => void];

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
          label="Ignore Children"
          name="ignoreChildren"
          value={!!state.ignoreChildren}
          onChange={setState}
        />
      </Grid>
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
