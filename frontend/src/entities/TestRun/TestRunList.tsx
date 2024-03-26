import { useParams } from "react-router-dom";
import { ListPage } from "../../components/UICrud";
import { TestRunServices } from "./services";

export const TestRunList: React.FC<any> = () => {
  const params = useParams();
  const testCaseId = params?.["*"] || "";

  return (
    <>
      <ListPage
        pageTitle="Test Runs"
        loader={async () => {
          return await TestRunServices.getTestRuns({ testCaseId });
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
