import { BACKEND_API_URL } from "../../contants";

const BACKEND_ENTITY_NAME = "user_setting";

const url = (endpoint: string) => {
  return `${BACKEND_API_URL}/${BACKEND_ENTITY_NAME}/${endpoint}`;
};

export const BACKEND_API_ROUTES = {
  GET_CONFIG: url("get-settings"),
  SAVE_CONFIG: url("save-settings"),
};
