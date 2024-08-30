import { BACKEND_API_URL } from "../../contants";

const BACKEND_ENTITY_NAME = "test_case";

const url = (endpoint: string) => {
  return `${BACKEND_API_URL}/${BACKEND_ENTITY_NAME}/${endpoint}`;
};

export const BACKEND_API_ROUTES = {
  GET_TEST_CASE_BY_ID: url("get-test-case"),
  GET_ALL_TEST_CASES: url("test-cases"),
};
