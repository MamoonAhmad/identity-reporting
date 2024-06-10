import { BugReportSharp, DoneSharp } from "@mui/icons-material";
import { ListPage } from "../../components/UICrud";
import { FunctionExecutionServices } from "./services";
import { Box } from "@mui/material";

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
        columnOverride={{
          name: ({ object }) => (
            <Box
              display={"flex"}
              alignItems={"center"}
              flexDirection={"row"}
            >
              <Box sx={{ mr: 0.5 }}>
                {object.executedSuccessfully ? (
                  <DoneSharp />
                ) : (
                  <BugReportSharp color="error" />
                )}
              </Box>
              {object.name}
            </Box>
          ),
        }}
        actions={{
          view: (o) => `/function-execution/view-function-execution/${o.id}`,
          delete: (o) => `/delete-function-execution/${o.id}`,
        }}
      />
    </>
  );
};
