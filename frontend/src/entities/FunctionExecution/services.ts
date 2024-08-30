import axios from "axios";
import { BACKEND_API_ROUTES } from "./constants";
import { ExecutedFunction } from "./types";

export const FunctionExecutionServices = {
  async getallFunctionExecutions(filters?: {
    [key: string]: any;
  }): Promise<ExecutedFunction[]> {
    const res = await axios.get(BACKEND_API_ROUTES.GET_ALL_EXECUTED_FUNCTIONS, {
      params: filters || undefined,
    });
    return res.data;
  },
  async getFunctionExecutionById(objectID: string): Promise<ExecutedFunction> {
    const res = await axios.get(
      `${BACKEND_API_ROUTES.GET_EXECUTED_FUNCTION_BY_ID}/${objectID}`
    );
    return res.data;
  },

  async runFunctionWithInput(functionMeta: any, inputToPass: any, mocks?: any) {
    const res = await axios.post(
      BACKEND_API_ROUTES.RUN_FUNCTION_WITH_INPUT,
      {
        ...functionMeta,
        inputToPass,
        mocks,
      }
    );
    return res.data;
  },
};
