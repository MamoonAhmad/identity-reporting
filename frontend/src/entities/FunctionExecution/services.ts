import axios from "axios";

export const FunctionExecutionServices = {
  async getallFunctionExecutions(filters?: { [key: string]: any }) {
    const res = await axios.get(
      "http://localhost:8002/executed_function/get-executed-functions?some=another",
      {
        params: filters || undefined,
      }
    );
    return res.data;
  },
  async getFunctionExecutionById(objectID: string) {
    const res = await axios.get(
      `http://localhost:8002/executed_function/get-executed-function/${objectID}`
    );
    return res.data;
  },
};
