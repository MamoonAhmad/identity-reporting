import { useParams } from "react-router-dom";
import { ListPage } from "../../components/UICrud";
import axios from "axios";

export const TestRunList: React.FC<any> = () => {
  const params = useParams();
  const testCaseID = params?.["*"];

  return (
    <>
      <ListPage
        loader={async () => {
          const res = await axios.get(
            `http://localhost:8002/test_run/get-test-runs/?testCaseId=${testCaseID}`
          );
          return res.data;
        }}
        keyColumnMap={{
          name: "Test Case",
          description: "Description",
          startTime: "Started At",
          endTime: "Ended At",
        }}
        columnOverride={{
          name: ({ object }) => object.testCase.name,
          description: ({ object }) => object.testCase.description,
          startTime: ({ object }) => object.executedFunction.startTime,
          endTime: ({ object }) => object.executedFunction.endTime,
        }}
        actions={{
          view: (o) => `/test-run/${o._id}`,
          delete: (o) => `/delete-function-execution/${o._id}`,
        }}
      />
    </>
  );
};
