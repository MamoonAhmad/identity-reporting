import axios from "axios";

export const TestCaseServices = {
  async getTestCaseById(objectID: string) {
    const res = await axios.get(
      `http://localhost:8002/get-test-case/${objectID}`
    );
    return res.data;
  },

  async getAllTestCases() {
    const res = await axios.get(`http://localhost:8002/test-cases`);
    return res.data;
  },

  async runFunctionWithInput(functionMeta: any, inputToPass: any) {
    const res = await axios.post(
      `http://localhost:8002/run-function-with-input`,
      {
        ...functionMeta,
        inputToPass,
      }
    );
    return res.data;
  },
};
