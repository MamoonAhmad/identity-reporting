import { TestSuiteForFunction, TestSuiteMetaData } from "./ConfigureTestCase";

import {
  Button,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { getFunctionTestConfigForExecutedFunction } from "../../../components/NestedObjectView/someutil";
import { AddSharp } from "@mui/icons-material";

import { useEffect, useReducer, useState } from "react";
import axios from "axios";

export const CreateUpdateTestSuite: React.FC<{
  testSuite: TestSuiteForFunction;
  onSave?: (testCase: TestSuiteForFunction) => void;
}> = ({ testSuite, onSave }) => {
  const [state, setState] = useReducer(
    (p: any, c: any) => ({ ...p, ...c }),
    {}
  ) as any as [
    Partial<TestSuiteForFunction>,
    (s: Partial<TestSuiteForFunction>) => void
  ];

  useEffect(() => {
    setState({ ...testSuite });
  }, [testSuite]);

  const onSaveTestSuite = (testSuite: TestSuiteForFunction) => {
    setState(testSuite);
    axios
      .post("http://localhost:8002/test_case/save-test-case", {
        ...testSuite,
      })
      .then((res) => {
        onSave?.(res.data);
        setState(res.data);
      });
  };

  if (!state) {
    return null;
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <TestSuiteMetaData testSuite={testSuite} />
        </Grid>
        <Grid item xs={12} my={2}>
          <TextField
            value={state.name}
            fullWidth
            label="Test Suite Name"
            onChange={(e) => {
              setState({ name: e.target.value });
            }}
            sx={{ my: 1 }}
          />
          <TextField
            value={state.description}
            fullWidth
            label="Test Suite Description"
            onChange={(e) => {
              setState({ description: e.target.value });
            }}
            sx={{ my: 1 }}
          />

          <TestCaseList
            testSuite={state as any}
            onChange={(t) => onSaveTestSuite(t)}
          />
          <Button
            fullWidth
            sx={{ p: 2, my: 3 }}
            color="primary"
            variant="contained"
            onClick={() => onSaveTestSuite(state as any)}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

const TestCaseList: React.FC<{
  testSuite: TestSuiteForFunction;
  onChange: (testCases: TestSuiteForFunction) => void;
}> = ({ testSuite, onChange }) => {
  if (!testSuite.id) {
    return (
      <Typography variant="subtitle2">
        Save the test suite first to add test cases.
      </Typography>
    );
  }
  return (
    <>
      <Typography variant="h5" textAlign={"left"} sx={{ my: 3 }}>
        Test Cases
      </Typography>

      <List>
        {testSuite.tests?.map((t) => {
          return (
            <ListItem>
              <ListItemText>
                <Link
                  href={`/test-case/view-test-case/${testSuite.id}?testCaseID=${t.id}`}
                  underline="hover"
                >
                  {t.name}
                </Link>
              </ListItemText>
            </ListItem>
          );
        })}
      </List>

      <Button
        onClick={() => {
          onChange({
            ...testSuite,
            tests: [
              ...(testSuite?.tests || []),
              {
                config: getFunctionTestConfigForExecutedFunction(
                  testSuite.functionMeta,
                  true
                ),
                mocks: {},
                inputToPass: testSuite.functionMeta.input,
                name: testSuite.functionMeta.name,
                id: new Date().getTime().toString(),
              },
            ],
          });
        }}
      >
        <AddSharp /> Add Test Case
      </Button>
    </>
  );
};
