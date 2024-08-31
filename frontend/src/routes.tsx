// const executedFunctions = createEntitiesFromDBRecords({
//   logs: logs as unknown as Log[],
// });

import { createBrowserRouter } from "react-router-dom";
import PersistentDrawerLeft from "./components/AppBar";
import { TestCaseConfig as TestCaseRoutesConfig } from "./entities/TestCase/routes";
import { TestRunRoutesConfig } from "./entities/TestRun/routes";
import {
  FunctionExecutionRoutes,
  FunctionExecutionRoutesConfig,
} from "./entities/FunctionExecution/routes";
import { ConfigRoutesConfig } from "./entities/Config/routes";
import { Redirect } from "./components/Redirect";

export const APP_ROUTES = createBrowserRouter([
  {
    path: "/",
    element: <PersistentDrawerLeft />,

    children: [
      {
        path: "/",
        element: (
          <Redirect to={`${FunctionExecutionRoutes.FunctionExecutionList}`} />
        ),
      },
      ...TestRunRoutesConfig,
      ...TestCaseRoutesConfig,
      ...FunctionExecutionRoutesConfig,
      ...ConfigRoutesConfig,
    ],
  },
]);
