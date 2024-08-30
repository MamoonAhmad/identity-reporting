import { v4 } from "uuid"
import * as loader from "./loader.js";
import { ENTITY_NAME_URL, EXECUTED_FUNCTION_PATH } from "./constants.js";
import { initDirectory } from "../../utils/initDirectory.js";
import { runFunctionsOnClientApp } from "../../clientApp.js";
import { ERROR_CODES, throwError } from "../../errors.js";
import { logger } from "../../logger.js";


/**
 * Given a code, it will create a run file with code and run the command to run client application.
 * Tracing agent's runner will read the run file, get the code from the file, and run the code in 
 * client environment. Runner will also override tracing agent collector to write executed function IDs
 * in the run file.
*/
export const runCodeOnClientApplication = async (socketIOInstance, code) => {

    await initDirectory(EXECUTED_FUNCTION_PATH);

    const url = (endpoint) => {
        return `${ENTITY_NAME_URL}/${endpoint}`
    }

    const runFileId = v4()

    // function run config for tracing agent
    const function_config = {
        execution_id: runFileId,
        input_to_pass: null,
        function_meta: null,
        code,
        action: "run_function",
        context: null,
    }

    // run code on client app
    logger.debug("Running code on Client App.")
    const [executedFunction] = await runFunctionsOnClientApp([
        function_config
    ])

    // save the executed function
    await loader.createExecutedFunction(executedFunction);

    try {
        socketIOInstance.emit(url("run_function_with_code:result"), executedFunction.id);
    } catch (e) {
        throwError(ERROR_CODES.USER_SOCKET_ERROR, { message: e?.toString() || "" })
    }
}

/**
 * Runs the function on client app with the provided input.
*/
export const runFunctionWithInput = async (args = {}) => {

    const { name, fileName, moduleName, inputToPass, mocks } = args

    // function run config for tracing agent.
    const executedFunctions = await runFunctionsOnClientApp(
        [
            {
                action: "run_function",
                input_to_pass: inputToPass,
                execution_id: v4(),
                function_meta: {
                    module_name: moduleName,
                    file_name: fileName,
                    function_name: name
                },
                context: {
                    mocks: mocks || undefined
                }
            }
        ]
    )

    return { executedFunction: executedFunctions[0] }
}

export const getExecutedFunctionByID = async (id) => {
    return await loader.getExecutedFunctionByID(id)
}

export const getAllExecutedFunctions = async (req, res) => {
    const filters = {};
    if (req.query?.fileName) {
        filters.fileName = {
            contains: req.query?.fileName
        }
    }
    if (req.query?.moduleName) {
        filters.moduleName = {
            contains: req.query?.moduleName
        }
    }
    if (req.query?.name) {
        filters.name = {
            contains: req.query?.name
        }
    }

    return loader.getAllExecutedFunctions(filters)
}

export const deleteExecutedFunction = (id) => loader.deleteExecutedFunction(id)
