// const executedFunctions = createEntitiesFromDBRecords({
//   logs: logs as unknown as Log[],
// });

import { createBrowserRouter } from "react-router-dom";
import PersistentDrawerLeft from "./components/AppBar";
import { TEST_CASE_VIEWS } from "./views/test_case";
import { TestComponent } from "./TestComp";
import { EXECUTION_VIEWS } from "./views/executions";

export const APP_ROUTES = createBrowserRouter([
  {
    path: "/",
    element: <PersistentDrawerLeft />,
    children: [
      {
        path: "test_case",
        element: <TEST_CASE_VIEWS.LIST />,
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
      {
        path: "executions/*",
        element: <EXECUTION_VIEWS.VIEW />,
      },
      {
        path: "executions/",
        element: <EXECUTION_VIEWS.LIST />,
      },
    ],
  },
]);
