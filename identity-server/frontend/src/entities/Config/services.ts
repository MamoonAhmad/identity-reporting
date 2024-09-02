import axios from "axios";
import { BACKEND_API_ROUTES } from "./constants";

export const ConfigServices = {
  async getConfig() {
    const res = await axios.get(BACKEND_API_ROUTES.GET_CONFIG);
    return res.data;
  },
  async saveConfig(settings: any) {
    const res = await axios.post(BACKEND_API_ROUTES.SAVE_CONFIG, settings);
    return res.data;
  },
};
