import React from "react";
import { TestConfig, TestConfigForFunction } from "../TestRun/TestRunView";

import { Box, TextField, Typography } from "@mui/material";

import { SidePanel } from "../SidePanel";
import { FunctionTestCreate } from "./FunctionTestCreate";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

export type TestCreateViewProps1 = {
  config: TestConfig;
  onChange: (c: TestConfig) => void;
};
export const TestCreateView: React.FC<TestCreateViewProps1> = ({
  config,
  onChange,
}) => {

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
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
          <Tab label="Basic Information" {...a11yProps(0)} />
          <Tab label="Configuration" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <TextField
          label="Test Case Name"
          onChange={(e) => {
            onChange({ ...config, name: e.target.value });
          }}
          value={config.name}
          fullWidth
        />
        <TextField
          sx={{ mt: 2, mb: 3 }}
          label="Test Case Description"
          onChange={(e) => {
            onChange({ ...config, description: e.target.value });
          }}
          value={config.description}
          multiline
          fullWidth
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
      <ExecutedFunctionsConfigurator
        existingFunctionConfig={config.testCases}
        onChange={(c) => {
          const cc: TestConfig = { ...config, testCases: c };
          onChange(cc);
        }}
      />
      </CustomTabPanel>
    </Box>
  );
};

export type ExecutedFunctionsConfiguratorProps = {
  existingFunctionConfig: TestConfigForFunction[];
  onChange: (c: TestConfigForFunction[]) => void;
};

export const ExecutedFunctionsConfigurator: React.FC<
  ExecutedFunctionsConfiguratorProps
> = ({ existingFunctionConfig, onChange }) => {
  return (
    <>
      <div className="flex flex-col items-start">
        {existingFunctionConfig?.map((e, i) => (
          <FunctionTestCreate
            existingConfig={e}
            onChange={(c) => {
              const arr = existingFunctionConfig;
              arr[i] = c as any;
              onChange([...arr]);
            }}
          />
        ))}
      </div>
      <SidePanel />
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
