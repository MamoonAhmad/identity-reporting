import "./App.css";

import { RouterProvider } from "react-router-dom";
import { APP_ROUTES } from "./routes";
import { Box } from "@mui/material";

function App() {
  return (
    <Box sx={{ height: "100vh", width: "100vw", overflow: "scroll", bgcolor: "lightgray" }}>
      <RouterProvider router={APP_ROUTES} />
    </Box>
  );
}

export default App;
