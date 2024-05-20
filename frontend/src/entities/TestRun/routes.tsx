import { RunAllTests } from "./RunAllTests";
import { TestRunList } from "./TestRunList";
import { ViewTestRun } from "./ViewTestRun";

const prefixRoute = (route: string) => `test-run/${route}`;

export const TestRunRoutes = {
  TestRunList: prefixRoute("test-run-list/*"),
  ViewTestRun: prefixRoute("test-run/*"),
  RunAllTests: prefixRoute("run-all-tests/*"),
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
  {
    path: TestRunRoutes.RunAllTests,
    element: <RunAllTests />
  }
];
