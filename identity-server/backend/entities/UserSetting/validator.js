import { ERROR_CODES, throwError } from "../../errors.js"




export const validateUserSetting = (userSettings) => {

    const defaultErrorMeta = { entity: "Config File" }

    if (!userSettings.server_port) {
        throwError(ERROR_CODES.VALIDATION_ERROR, { ...defaultErrorMeta, field: "server_port", extraMessage: " server_port should be present in config file and should be a valid system port." })
    }

    userSettings.server_port = parseInt(userSettings.server_port);
    if (!userSettings.server_port) {
        throwError(ERROR_CODES.VALIDATION_ERROR, { ...defaultErrorMeta, field: "server_port", extraMessage: " server_port should be an integer value." })
    }

    if (userSettings.max_executed_functions !== undefined) {
        if (userSettings.max_executed_functions) {
            userSettings.max_executed_functions = parseInt(userSettings.max_executed_functions)
            if (!userSettings.max_executed_functions || userSettings.max_executed_functions < 0) {
                throwError(ERROR_CODES.VALIDATION_ERROR, { ...defaultErrorMeta, field: "max_executed_functions", extraMessage: " Should be an integer value greater than or equal to 0. 0 means unlimited." })
            }
        }

    }

    // Tests Directory
    // Defaults to /tests from the root of project
    if(!userSettings.tests_directory) {
        userSettings.tests_directory = "tests";
    }

}