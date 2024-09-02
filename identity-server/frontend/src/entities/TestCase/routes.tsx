import { CreateTestFromExecutedFunction } from "./CreateTestFromExecutedFunction";
import { TestCaseList } from "./TestCaseList";
import { ViewTestCase } from "./ViewTestCase";

const prefixRoute = (route: string) => `/test-case/${route}`;

export const TestCaseRoutes = {
  ViewTestCase: prefixRoute("view-test-case"),
  CreateTestFromExecutedFunction: prefixRoute(
    "create-test-from-executed-function"
  ),
  TestCaseList: prefixRoute(""),
};

export const TestCaseConfig = [
  {
    path: `${TestCaseRoutes.ViewTestCase}/*`,
    element: <ViewTestCase />,
  },
  {
    path: `${TestCaseRoutes.CreateTestFromExecutedFunction}/*`,
    element: <CreateTestFromExecutedFunction />,
  },
  {
    path: TestCaseRoutes.TestCaseList,
    element: <TestCaseList />,
  },
];
