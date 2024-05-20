import axios from "axios";

export const ConfigServices = {
  async getConfig() {
    const res = await axios.get("http://localhost:8002/user_setting/get-settings");
    return res.data;
  },
  async saveConfig(settings: any) {
    const res = await axios.post(
      "http://localhost:8002/user_setting/save-settings",
      settings
    );
    return res.data;
  },
};
