import { AddSharp, DeleteSharp, EditSharp } from "@mui/icons-material";
import {
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { useGeneralState } from "../../helpers/useGeneralState";
import { CreateTestModal } from "./Steps";
import { useCallback, useEffect } from "react";
import { TestCaseService } from "../../services/base";
import { TestConfig, TestConfigJSON } from "../TestRun/TestRunView";
import { Link } from "react-router-dom";

export const TestCaseListView: React.FC = () => {
  const [state, setState] = useGeneralState<{
    loading: boolean;
    show: boolean;
    testCases: TestConfig[];
  }>({ loading: true, show: false, testCases: [] });

  const fetchData = useCallback(async () => {
    new TestCaseService().get({}).then((v) => {
      setState({ testCases: v as any, loading: false });
    });
  }, []);
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      <div className="w-full p-5">
        <div className="flex items-center w-full mt-2 mb-5">
          <h1 className="text-lg font-semibold">Test Cases</h1>
          <div className="flex grow items-center justify-end">
            <button
              className={`bg-blue-500 text-white p-1 test-sm px-3 rounded`}
              onClick={() => setState({ show: true })}
            >
              <AddSharp /> Next
            </button>
          </div>
        </div>
        {state?.loading ? (
          <CircularProgress />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state?.testCases?.map((t, i) => {
                return (
                  <TableRow>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit Test Case">
                        <Link to={`/test_case/${t.id}`}>
                          <IconButton>
                            <EditSharp />
                          </IconButton>
                        </Link>
                      </Tooltip>
                      <Tooltip title="Delete Test Case">
                        <IconButton>
                          <DeleteSharp />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!state?.testCases && (
                <TableRow>
                  <TableCell colSpan={3}>
                    Didn't find any existing test cases.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {state?.show && (
        <CreateTestModal
          onCreate={(c) => {
            setState({ testCases: [], loading: true });
            new TestCaseService().post(c as TestConfigJSON).then(() => {
              fetchData().then(() => setState({ show: false }));
            });
          }}
        />
      )}
    </>
  );
};
