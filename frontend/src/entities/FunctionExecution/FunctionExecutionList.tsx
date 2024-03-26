import { ListPage } from "../../components/UICrud";
import { FunctionExecutionServices } from "./services";

export const FunctionExecutionList: React.FC<any> = () => {
  return (
    <>
      <ListPage
        pageTitle="Function Executions"
        loader={FunctionExecutionServices.getallFunctionExecutions}
        keyColumnMap={{
          name: "Function Name",
          description: "Description",
          startTime: "Started At",
          endTime: "Ended At",
        }}
        actions={{
          view: (o) => `/function-execution/${o._id}`,
          delete: (o) => `/delete-function-execution/${o._id}`,
        }}
      />
    </>
  );
};
