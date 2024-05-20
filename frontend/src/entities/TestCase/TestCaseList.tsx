import { ListPage } from "../../components/UICrud";
import { TestCaseServices } from "./services";
import { TestCaseRoutes } from "./routes";
import { Box, Button, Grid, Typography } from "@mui/material";
import { PlayArrowSharp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { TestRunRoutes } from "../TestRun/routes";

export const TestCaseList: React.FC<any> = () => {
  const navigate = useNavigate();
  return (
    <>
      <ListPage
        pageTitle={
          <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
            <Typography variant="h4" sx={{ flexGrow: 1, textAlign: "left" }}>
              Test Cases
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                navigate(`/${TestRunRoutes.RunAllTests.replace("*", "")}`);
              }}
            >
              <PlayArrowSharp sx={{ mr: 1 }} /> Run All Tests
            </Button>
          </Box>
        }
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
