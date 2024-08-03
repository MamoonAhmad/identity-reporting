import { ListPage } from "../../components/UICrud";
import { TestCaseServices } from "./services";
import { TestCaseRoutes } from "./routes";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import {
  DeleteSharp,
  PlayArrowSharp,
  VisibilitySharp,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { TestRunRoutes } from "../TestRun/routes";
import { PageContainer } from "../../components/PageContainer";
import { PageTitle } from "../../components/PageTitle";
import { useListPage } from "../../hooks/useListPage";
import { Filter } from "../../components/Filter";

export const TestCaseList: React.FC<any> = () => {
  const { data, loading, filters, setFilters } = useListPage(
    TestCaseServices.getAllTestCases,
    ["moduleName", "fileName", "name"]
  );
  return (
    <>
      <PageContainer>
        <PageTitle title="Test Suites">
          <Link
            to={`/test-run/run-all-tests?${new URLSearchParams(
              filters
            ).toString()}`}
          >
            <Button variant="outlined">
              <PlayArrowSharp sx={{ mr: 1 }} />
              Run Tests
            </Button>
          </Link>
        </PageTitle>

        <Grid container>
          <Grid item xs={12} my={1}>
            <Filter
              filters={filters || {}}
              filterMap={{
                name: "Function Name",
                fileName: "File Name",
                moduleName: "Module Name",
              }}
              onFilter={setFilters}
              title="Filter Test Suites"
            />
          </Grid>

          <Grid item xs={12}>
            {loading && <CircularProgress />}
            {data && (
              <>
                <ListPage
                  data={data}
                  keyColumnMap={{
                    name: "Test Suite Name",
                    description: "Description",
                    fileName: "File Name",
                  }}
                  columnOverride={{
                    fileName: ({ object }) =>
                      object?.functionMeta?.fileName || "",
                  }}
                  actions={(o) => {
                    return (
                      <>
                        <Link to={`view-test-case/${o.id}`}>
                          <VisibilitySharp />
                        </Link>
                        <IconButton onClick={() => undefined} sx={{ mr: 1 }}>
                          <DeleteSharp />
                        </IconButton>
                      </>
                    );
                  }}
                />
              </>
            )}
          </Grid>
        </Grid>
      </PageContainer>
    </>
  );
};
