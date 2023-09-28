// import { useState } from "react";
import "./App.css";

// import logs from "./tests/data/logs.json";
// import { createEntitiesFromDBRecords } from "./helpers/function";
// import { Log } from "./Log";
// import { TestCreateView } from "./components/TestCreate/TestCreateView";
import { StoreContextProvider } from "./context/StoreContext";
import { SidePanel } from "./components/SidePanel";
import { CreateTestModal } from "./components/TestCreate/Steps";
import PersistentDrawerLeft from "./components/AppBar";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { TestCaseListView } from "./components/TestCreate/TestCaseListView";
import { TestCreateView } from "./components/TestCreate/TestCreateView";
import { TestComponent } from "./TestComp";
import { TEST_CASE_VIEWS } from "./views/test_case";

// const executedFunctions = createEntitiesFromDBRecords({
//   logs: logs as unknown as Log[],
// });

export const APP_ROUTES = createBrowserRouter([
  {
    path: "/",
    element: <PersistentDrawerLeft />,
    children: [
      {
        path: "test_case",
        element: <TestCaseListView />,
      },
      {
        path: "test_case/create",
        element: <TEST_CASE_VIEWS.CREATE />,
      },
      {
        path: "test_case/*",
        element: <TEST_CASE_VIEWS.UPDATE />,
      },
      {
        path: "new",
        element: <TestComponent />,
      },
    ],
  },
]);

function App() {
  // const [count, setCount] = useState(0);

  return (
    <StoreContextProvider>
      <div
        style={{ height: "100vh", width: "100vw", overflow: "scroll" }}
        className="bg-white"
      >
        <RouterProvider router={APP_ROUTES} />
      </div>
    </StoreContextProvider>
  );
}

export default App;
