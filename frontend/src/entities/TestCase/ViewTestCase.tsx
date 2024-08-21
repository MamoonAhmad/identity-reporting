import { Breadcrumbs, Button, Link, Typography } from "@mui/material";
import { ViewPage } from "../../components/UICrud/ViewPage";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { TestCaseServices } from "./services";
import axios from "axios";
import { TestCaseView } from "./components/TestCaseView";
import { TestCaseRoutes } from "./routes";
import { NavigateNext } from "@mui/icons-material";
import { CreateUpdateTestSuite } from "./components/CreateUpdateTestSuite";
import { TestSuiteForFunction } from "./components/ConfigureTestCase";

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
              onClick={() => {
                axios
                  .post("http://localhost:8002/run-test", {
                    testCaseId: object._id,
                  })
                  .then((res) => {
                    const testRun = res.data;
                    navigate("/test-run/test-run/" + testRun._id);
                  });
              }}
            >
              Run Test
            </Button>
            <Button onClick={() => navigate(`/test-runs/${object._id}`)}>
              View Test Runs
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
            url: TestCaseRoutes.ViewTestCase.replace("*", object.id),
            label: object.name,
          },
        ];
        if (selectedTestCaseID) {
          breadCrumbs.push({
            url: TestCaseRoutes.ViewTestCase.replace(
              "*",
              `${object.id}?testCaseID=${selectedTestCaseID}`
            ),
            label:
              object?.tests?.find((t: any) => t.id === selectedTestCaseID)
                ?.name || selectedTestCaseID,
          });
        }
        const onSaveTestSuite = (testSuite: TestSuiteForFunction) => {
          axios
            .post("http://localhost:8002/test_case/save-test-case", {
              ...testSuite,
            })
            .then((res) => {
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
