import axios from "axios";

export const TestCaseServices = {
  async getTestCaseById(objectID: string) {
    const res = await axios.get(
      `http://localhost:8002/test_case/get-test-case/${objectID}`
    );
    return res.data;
  },

  async getAllTestCases(filters?: { [key: string]: any }) {
    const res = await axios.get(`http://localhost:8002/test_case/test-cases`, {
      params: filters,
    });
    return res.data;
  },

  async runFunctionWithInput(functionMeta: any, inputToPass: any) {
    const res = await axios.post(
      `http://localhost:8002/executed_function/run-function-with-input`,
      {
        ...functionMeta,
        inputToPass,
      }
    );
    return res.data;
  },
};
