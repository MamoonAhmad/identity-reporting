import { BACKEND_API_URL } from "../../contants";

const BACKEND_ENTITY_NAME = "test_run";

const url = (endpoint: string) => {
  return `${BACKEND_API_URL}/${BACKEND_ENTITY_NAME}/${endpoint}`;
};

const socketEvent = (endpoint: string) => {
    return `${BACKEND_ENTITY_NAME}/${endpoint}`
}

export const BACKEND_API_ROUTES = {
  GET_TEST_CASE_BY_ID: url("get-test-case"),
  GET_ALL_TEST_CASES: url("test-cases"),
};


export const BACKEND_SOCKET_EVENTS = {
    RUN_TEST_WITH_FILTER: socketEvent("run_test"),
    TEST_SUITE_RESULT: socketEvent("test_run_result"),
    TEST_SUITE_RESULT_ERROR: socketEvent("test_run_result:error")
}