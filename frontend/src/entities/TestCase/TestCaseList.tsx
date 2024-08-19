import { useState } from "react";
import { Button, CircularProgress, Grid, IconButton } from "@mui/material";
import { DeleteSharp, PlayArrowSharp } from "@mui/icons-material";
import { Link } from "react-router-dom";

import { ListPage } from "../../components/UICrud";
import { TestCaseServices } from "./services";
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
                  viewLink={(o) => `view-test-case/${o.id}`}
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
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const [_loading, _setLoading] = useState(false);
                    if (_loading) {
                      return <CircularProgress size={"small"} />;
                    }

                    return (
                      <>
                        <IconButton
                          onClick={() => {
                            _setLoading(true);

                            fetch(
                              `http://localhost:8002/test_case/delete-test-case/${o.id}`,
                              {
                                method: "POST",
                              }
                            ).then(() => {
                              _setLoading(false);
                              window.location.reload();
                            });
                          }}
                          sx={{ mr: 1 }}
                        >
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
