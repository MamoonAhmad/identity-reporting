import { RunAllTests } from "./RunAllTests";

const prefixRoute = (route: string) => `test-run/${route}`;

export const TestRunRoutes = {
  TestRunList: prefixRoute("test-run-list/*"),
  ViewTestRun: prefixRoute("test-run/*"),
  RunAllTests: prefixRoute("run-all-tests/*"),
};

export const TestRunRoutesConfig = [
  {
    path: TestRunRoutes.RunAllTests,
    element: <RunAllTests />,
  },
];
