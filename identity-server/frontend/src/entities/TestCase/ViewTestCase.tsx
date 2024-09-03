import { Breadcrumbs, Button, Link, Typography } from "@mui/material";
import { ViewPage } from "../../components/UICrud/ViewPage";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { TestCaseServices } from "./services";
import { TestCaseRoutes } from "./routes";
import { NavigateNext, PlayArrowSharp } from "@mui/icons-material";
import { CreateUpdateTestSuite } from "./components/CreateUpdateTestSuite";
import { TestSuiteForFunction } from "./types";
import { TestRunRoutes } from "../TestRun/routes";

export const ViewTestCase = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const objectID = params?.["*"];
  const navigate = useNavigate();
  if (!objectID) {
    return <>Test Suite ID not present in param.</>;
  }
  const selectedTestCaseID = searchParams.get("testCaseID") || undefined;

  return (
    <ViewPage
      objectID={objectID}
      title={selectedTestCaseID ? "Test Case" : "Test Suite"}
      HeaderActions={({ object }) => {
        return (
          <>
            <Button
              variant="outlined"
              onClick={() => {
                navigate(
                  `${TestRunRoutes.RunAllTests}/?testSuiteID=${object.id}`
                );
              }}
            >
              <PlayArrowSharp sx={{ mr: 1 }} />
              Run Test
            </Button>
          </>
        );
      }}
      dataLoader={async () => {
        return await TestCaseServices.getTestCaseById(objectID);
      }}
      Content={({ object }) => {
        const breadCrumbs = [
          {
            url: TestCaseRoutes.TestCaseList,
            label: "All Test Cases",
          },
          {
            url: `${TestCaseRoutes.ViewTestCase}/${object.id}`,
            label: object.name,
          },
        ];
        if (selectedTestCaseID) {
          breadCrumbs.push({
            url: `${TestCaseRoutes.ViewTestCase}/${object.id}?testCaseID=${selectedTestCaseID}`,
            label:
              object?.tests?.find((t: any) => t.id === selectedTestCaseID)
                ?.name || selectedTestCaseID,
          });
        }
        const onSaveTestSuite = (testSuite: TestSuiteForFunction) => {
          TestCaseServices.saveTestSuite(testSuite)
            .then(() => {
              window.location.reload();
            });
        };

        return (
          <>
            <Breadcrumbs
              separator={<NavigateNext fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ my: 2 }}
            >
              {breadCrumbs.map((b, i) =>
                i === breadCrumbs.length - 1 ? (
                  <Typography color={"text.primary"}>{b.label}</Typography>
                ) : (
                  <Link href={b.url} underline="hover" key="1" color="inherit">
                    {b.label}
                  </Link>
                )
              )}
            </Breadcrumbs>

            <CreateUpdateTestSuite
              testSuite={{
                ...object,
              }}
              onSave={onSaveTestSuite}
              selectedTestCaseID={selectedTestCaseID}
            />
          </>
        );
      }}
    ></ViewPage>
  );
};
