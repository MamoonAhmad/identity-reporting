import { ListPage } from "../../components/UICrud";
import axios from "axios";

export const TestCaseList: React.FC<any> = () => {
  return (
    <>
      <ListPage
        loader={async () => {
          const res = await axios.get(
            "http://localhost:8002/get-executed-functions"
          );
          return res.data;
        }}
        keyColumnMap={{
          name: "Function Name",
          description: "Description",
          startTime: "Started At",
          endTime: "Ended At",
        }}
        actions={{
          view: (o) => `/view-function-execution/${o._id}`,
          delete: (o) => `/delete-function-execution/${o._id}`,
        }}
      />
    </>
  );
};
