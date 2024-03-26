import "./App.css";

import { RouterProvider } from "react-router-dom";
import { APP_ROUTES } from "./routes";

function App() {
  return (
    <div
      style={{ height: "100vh", width: "100vw", overflow: "scroll" }}
      className="bg-white"
    >
      <RouterProvider router={APP_ROUTES} />
    </div>
  );
}

export default App;
