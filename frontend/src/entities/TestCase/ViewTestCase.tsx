import { Button } from "@mui/material";
import { ViewPage } from "../../components/UICrud/ViewPage";
import { useNavigate, useParams } from "react-router-dom";
import { TestCaseServices } from "./services";
import { ConfigureTestCase } from "./components/ConfigureTestCase";

export const ViewTestCase = () => {
  const params = useParams();
  const objectID = params?.["*"];
  const navigate = useNavigate();
  if (!objectID) {
    return <>Test Case ID not present in param.</>;
  }
  return (
    <ViewPage
      title="Function Execution View"
      HeaderActions={({ object }) => {
        return (
          <Button onClick={() => navigate(`/test-runs/${object._id}`)}>
            View Test Runs
          </Button>
        );
      }}
      dataLoader={async () => {
        return await TestCaseServices.getTestCaseById(objectID);
      }}
      Content={({ object }) => <ConfigureTestCase testCase={object} />}
    ></ViewPage>
  );
};
