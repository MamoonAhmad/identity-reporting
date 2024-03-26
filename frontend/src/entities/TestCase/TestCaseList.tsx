import { ListPage } from "../../components/UICrud";
import { TestCaseServices } from "./services";
import { TestCaseRoutes } from "./routes";

export const TestCaseList: React.FC<any> = () => {
  return (
    <>
      <ListPage
        pageTitle="Test Cases"
        loader={async () => {
          return await TestCaseServices.getAllTestCases();
        }}
        keyColumnMap={{
          name: "Name",
          description: "Description",
        }}
        actions={{
          view: (o) => TestCaseRoutes.ViewTestCase.replace("*", o._id),
          delete: (o) => `/delete-function-execution/${o._id}`,
        }}
      />
    </>
  );
};
