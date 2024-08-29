import { BACKEND_API_URL } from "../../contants";

const BACKEND_ENTITY_NAME = "executed_function";

const url = (endpoint: string) => {
  return `${BACKEND_API_URL}/${BACKEND_ENTITY_NAME}/${endpoint}`;
};

export const BACKEND_API_ROUTES = {
  GET_ALL_EXECUTED_FUNCTIONS: url("get-executed-functions"),
  GET_EXECUTED_FUNCTION_BY_ID: url("get-executed-function"),
  RUN_FUNCTION_WITH_INPUT: url("run-function-with-input"),
};
