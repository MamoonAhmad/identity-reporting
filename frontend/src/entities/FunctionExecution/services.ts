import axios from "axios";

export const FunctionExecutionServices = {
  async getallFunctionExecutions() {
    const res = await axios.get("http://localhost:8002/executed_function/get-executed-functions");
    return res.data;
  },
  async getFunctionExecutionById(objectID: string) {
    const res = await axios.get(
      `http://localhost:8002/executed_function/get-executed-function/${objectID}`
    );
    return res.data;
  },
};
