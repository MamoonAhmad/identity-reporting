import { v4 } from "uuid"
import * as loader from "./loader.js";
import { getExecutedFunctionTreeFromExecutedFunctions } from "./utils.js";
import { ENTITY_NAME_URL, EXECUTED_FUNCTION_PATH } from "./constants.js";
import { initDirectory } from "../../utils/initDirectory.js";
import { runFunctionsOnClientApp } from "../../clientApp.js";


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

    const function_config = {
        execution_id: runFileId,
        input_to_pass: null,
        function_meta: null,
        code,
        action: "run_function",
        context: null,
    }

    try {

        const [executedFunction] = await runFunctionsOnClientApp([
            function_config
        ])
        await loader.createExecutedFunction(executedFunction);
        socketIOInstance.emit(url("run_function_with_code:result"), executedFunction.id);

    } catch (e) {
        throw e
    }
}

export const runFunctionWithInput = async (args = {}) => {

    const { name, fileName, packageName, environmentName, moduleName, inputToPass, mocks } = args

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


export const saveExecutedFunctions = async (functions) => {



    const functionsToSave = getExecutedFunctionTreeFromExecutedFunctions(functions)

    const promises = functionsToSave.map(f => loader.createExecutedFunction(f))

    return await Promise.all(promises)

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
