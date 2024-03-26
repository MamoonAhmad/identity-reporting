import { ViewPage } from "../../components/UICrud/ViewPage";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ConfigureTestCase as TestConfig } from "./_TestConfig";
import { Button } from "@mui/material";

export const ConfigureTestCase = () => {
  const params = useParams();
  const objectID = params?.["*"];
  const navigate = useNavigate();
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
        const res = await axios.get(
          `http://localhost:8002/test-case/${objectID}`
        );
        return res.data;
      }}
      Content={({ object }) => <TestConfig testCase={object} />}
    ></ViewPage>
  );
};
