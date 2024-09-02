import React from "react";
import { TestSuiteMetaData } from "./ConfigureTestCase";

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
import { AddSharp } from "@mui/icons-material";

import { TestCaseView } from "./TestCaseView";
import { useObjectChange } from "./useObjectChange";
import { getFunctionTestConfigForExecutedFunction } from "../utils/getFunctionTestConfigForExecutedFunction";
import { TestSuiteForFunction } from "../types";

export const CreateUpdateTestSuite: React.FC<{
  testSuite: TestSuiteForFunction;
  onSave: (testCase: TestSuiteForFunction) => void;
  selectedTestCaseID?: string;
}> = ({ testSuite, onSave, selectedTestCaseID }) => {
  const updateState = useObjectChange(testSuite, (obj) => [
    obj.name,
    obj.description,
  ]);
  console.log("re render main");

  if (!testSuite) {
    return null;
  }

  return (
    <>
      <Grid container>
        {selectedTestCaseID ? (
          <Grid item xs={12}>
            <TestCaseView
              selectedTestCaseID={selectedTestCaseID}
              testSuite={testSuite}
            />
          </Grid>
        ) : null}
        {!selectedTestCaseID ? (
          <>
            <Grid item xs={12}>
              <TestSuiteMetaData testSuite={testSuite} />
            </Grid>
            <Grid item xs={12} my={2}>
              <TextField
                defaultValue={testSuite.name}
                fullWidth
                label="Test Suite Name"
                value={testSuite.name}
                onChange={(e) => {
                  updateState({ name: e.target.value });
                }}
                sx={{ my: 1 }}
              />
              <TextField
                value={testSuite.description}
                fullWidth
                label="Test Suite Description"
                onChange={(e) => {
                  updateState({ description: e.target.value });
                }}
                sx={{ my: 1 }}
              />
              <Grid
                item
                xs={12}
                display={"flex"}
                flexDirection={"column"}
                alignItems={"flex-start"}
              >
                <TestCaseList testSuite={testSuite} onSave={onSave} />
              </Grid>
            </Grid>
          </>
        ) : null}
        <Grid item xs={12}>
          <Button
            fullWidth
            sx={{ p: 2, my: 3 }}
            color="primary"
            variant="contained"
            onClick={() => onSave(testSuite as any)}
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
  onSave: (testSuite: TestSuiteForFunction) => void;
}> = React.memo(({ testSuite, onSave }) => {
  const updateState = useObjectChange(testSuite, (obj) => [obj.tests.length]);

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
          updateState({
            tests: [
              ...(testSuite?.tests || []),
              {
                config: getFunctionTestConfigForExecutedFunction(
                  testSuite.functionMeta,
                  true
                ),
                mocks: {},
                inputToPass: testSuite.functionMeta.input,
                name: `Test Case ${(testSuite?.tests?.length || 0) + 1}`,
                id: new Date().getTime().toString(),
              },
            ],
          });
          onSave(testSuite);
        }}
      >
        <AddSharp /> Add Test Case
      </Button>
    </>
  );
});
