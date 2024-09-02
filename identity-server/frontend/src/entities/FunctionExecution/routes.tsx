import { FunctionExecutionList } from "./FunctionExecutionList";
import { ViewFunctionExecution } from "./ViewFunctionExecution";

const prefixRoute = (route: string) => `/function-execution/${route}`;

export const FunctionExecutionRoutes = {
  FunctionExecutionList: prefixRoute("function-execution-list"),
  ViewFunctionExecution: prefixRoute("view-function-execution"),
};

export const FunctionExecutionRoutesConfig = [
  {
    path: FunctionExecutionRoutes.FunctionExecutionList,
    element: <FunctionExecutionList />,
  },
  {
    path: `${FunctionExecutionRoutes.ViewFunctionExecution}/*`,
    element: <ViewFunctionExecution />,
  },
];
