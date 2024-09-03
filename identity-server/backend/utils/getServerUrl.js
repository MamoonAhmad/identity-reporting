
import * as userSettingsLoader from "../entities/UserSetting/loader.js";

export const getServerUrl = async () => {
    let serverURL = "http://localhost";
    const userSettings = await userSettingsLoader.getSettings();
    serverURL = `${serverURL}:${userSettings.server_port}`
    return serverURL;
}

export const getServerRestApiUrl = async () => {
    return `${await getServerUrl()}/api`
}