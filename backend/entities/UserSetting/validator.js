import { ERROR_CODES, throwError } from "../../errors.js"




export const validateUserSetting = (userSettings) => {

    const defaultErrorMeta = { entity: "Config File" }

    if (!userSettings.server_port) {
        throwError(ERROR_CODES.VALIDATION_ERROR, { ...defaultErrorMeta, field: "server_port", extraMessage: " server_port should be present in config file and should be a valid system port." })
    }

    userSettings.server_port = parseInt(userSettings.server_port);
    if(!userSettings.server_port) {
        throwError(ERROR_CODES.VALIDATION_ERROR, { ...defaultErrorMeta, field: "server_port", extraMessage: " server_port should be an integer value." })
    }

}