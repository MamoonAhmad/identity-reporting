import axios from "axios";

export const TestRunServices = {
  async getTestRuns({ testCaseId = null }: { testCaseId: string | null }) {
    const params: string[] = [];

    if (testCaseId) {
      params.push(`testCaseId=${testCaseId}`);
    }

    const queryString = params.length ? `?${params.join("&")}` : "";
    const res = await axios.get(
      `http://localhost:8002/test_run/get-test-runs/${queryString}`
    );
    return res.data;
  },

  async getTestRunById(objectID: string) {
    const res = await axios.get(
      `http://localhost:8002/test_run/get-test-run/${objectID}`
    );
    return res.data;
  },
};
