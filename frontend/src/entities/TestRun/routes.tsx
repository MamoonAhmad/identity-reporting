import { TestRunList } from "./TestRunList";
import { ViewTestRun } from "./ViewTestRun";

const prefixRoute = (route: string) => `test-run/${route}`;

export const TestRunRoutes = {
  TestRunList: prefixRoute("test-run-list/*"),
  ViewTestRun: prefixRoute("test-run/*"),
};

export const TestRunRoutesConfig = [
  {
    path: TestRunRoutes.TestRunList,
    element: <TestRunList />,
  },
  {
    path: TestRunRoutes.ViewTestRun,
    element: <ViewTestRun />,
  },
];
