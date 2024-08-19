

export const ERROR_CODES = {
    PORT_ALREADY_IN_USE: "PORT_ALREADY_IN_USE",
    CONFIG_FILE_NOT_FOUND: "CONFIG_FILE_NOT_FOUND",
    EXTERNAL_ERROR: "EXTERNAL_ERROR",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    USER_SOCKET_ERROR: "USER_SOCKET_ERROR"
}

const ERROR_MESSAGES = {
    EXTERNAL_ERROR: '&message&',
    PORT_ALREADY_IN_USE: `Port &port& is already in use.`,
    CONFIG_FILE_NOT_FOUND: `Config file does not exist. Create 'identity_config.json' in the root of your project.`,
    VALIDATION_ERROR: "&entity& Error. &field& is not valid.&extraMessage&",
    USER_SOCKET_ERROR: "Error communicating with the user socket.&message&"
}




class IdentityError extends Error {
    errorCode = null;
}

export const throwError = (errorCode, metaData) => {

    let errorMessage = ERROR_MESSAGES[errorCode];

    if (!errorMessage) {
        throw new IdentityError();
    }
    Object.keys(metaData).forEach(key => {
        errorMessage = errorMessage.replace(`&${key}&`, metaData[key]);
    })

    const error = new IdentityError(errorMessage);
    error.errorCode = errorCode;
    throw error;
}