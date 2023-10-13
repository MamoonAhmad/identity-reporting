import React from "react";

import { Box, TextField, Typography } from "@mui/material";

import { FunctionTestCreate } from "./FunctionTestCreate";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { FunctionValidator } from "../../validators/function";
import { TestValidator } from "../../validators/test";

export type TestCreateViewProps1 = {
  config: TestValidator;
  onChange: (c: TestValidator) => void;
};
export const TestCreateView: React.FC<TestCreateViewProps1> = ({
  config,
  onChange,
}) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Configuration" {...a11yProps(0)} />
          <Tab label="Basic Information" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
        <ExecutedFunctionsConfigurator
          existingFunctionConfig={config.config.functions}
          onChange={(functions) => {
            const cc: TestValidator = new TestValidator({
              ...config.config,
              functions,
            });
            onChange(cc);
          }}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <TextField
          label="Test Case Name"
          onChange={(e) => {
            onChange(
              new TestValidator({ ...config.config, name: e.target.value })
            );
          }}
          value={config.config.name}
          fullWidth
        />
        <TextField
          sx={{ mt: 2, mb: 3 }}
          label="Test Case Description"
          onChange={(e) => {
            onChange(
              new TestValidator({
                ...config.config,
                description: e.target.value,
              })
            );
          }}
          value={config.config.description}
          multiline
          fullWidth
        />
      </CustomTabPanel>
    </Box>
  );
};

export type ExecutedFunctionsConfiguratorProps = {
  existingFunctionConfig: FunctionValidator[];
  onChange: (c: FunctionValidator[]) => void;
};

export const ExecutedFunctionsConfigurator: React.FC<
  ExecutedFunctionsConfiguratorProps
> = ({ existingFunctionConfig, onChange }) => {
  return (
    <>
      <div className="flex flex-col items-start">
        {existingFunctionConfig?.map((e, i) => (
          <FunctionTestCreate
            namePath={[
              `functions.${i}.${e.config.targetValue.executedFunctionMeta.name}`,
            ]}
            existingConfig={e}
            onChange={(c: FunctionValidator) => {
              const arr = existingFunctionConfig;
              arr[i] = c;
              onChange([...arr]);
            }}
          />
        ))}
      </div>
    </>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}


// Fix Validators
// Fix the entity execution
// create small field decorators ?
// all the values in dict inout and output ?
// how to save the objects copies efficiently input output changes
// field options
// IO Driver
// control configs for how much loggin. input output
// unit tests backend
// unit tests frontend
// default parameters
// Object reference
// created updated and deleted objects match
/**
 * Test Creation Tool {
 *
 *  name a test case
 *  copy test json
 *  create test case from logs
 *  provide default input
 *  a way to save the test case
 *   options for value validator like ( is set )
 *  literal: has a non null value, should equal '', custom value (type mismatch ?)
 *  array: Exact Keys, Ignore
 *  // when custom value is inserted, parse it and show it in edit mode
 *  //
 *
 *  exeception validator
 *  log validator ?
 *  created objects validator
 *  updated and deleted validator
 *
 *  unit tests
 *
 * }
 *
 * Test Runner Tool {
 *
 *  a way to run the test case
 *  a way to run multiple test cases
 *  when a test case fails, find a way to update the test case
 *
 *
 *   uni tests
 *
 * }
 */
