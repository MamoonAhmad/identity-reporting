import axios from "axios";

import { BACKEND_API_ROUTES } from "./constants";
import { TestSuiteForFunction } from "./types";

export const TestCaseServices = {
  async getTestCaseById(objectID: string) {
    const res = await axios.get(
      `${BACKEND_API_ROUTES.GET_TEST_CASE_BY_ID}/${objectID}`
    );
    return res.data;
  },

  async getAllTestCases(filters?: {
    [key: string]: any;
  }): Promise<TestSuiteForFunction[]> {
    const res = await axios.get(BACKEND_API_ROUTES.GET_ALL_TEST_CASES, {
      params: filters,
    });
    return res.data;
  },

  async onSaveTestSuite(
    testSuite: TestSuiteForFunction
  ): Promise<TestSuiteForFunction> {
    return axios
      .post("http://localhost:8002/test_case/save-test-case", {
        ...testSuite,
      })
      .then((res) => res.data);
  },
};
