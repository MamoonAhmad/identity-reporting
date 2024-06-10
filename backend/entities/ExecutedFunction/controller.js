import { v4 } from "uuid"
import fs from "fs"
import { exec } from "child_process";
import * as loader from "./loader.js";
import * as userSettingLoader from "../UserSetting/loader.js"
import { getExecutedFunctionTreeFromExecutedFunctions } from "./utils.js";
import { ENTITY_NAME_URL, EXECUTED_FUNCTION_PATH } from "./constants.js";
import { IDENTITY_TEMP_DIRECTORY } from "../../constants.js";
import { writeFileJSONPromised } from "../../utils/writeFileJSONPromised.js";
import { readJSONFilePromised } from "../../utils/readJSONFilePromised.js";
import { initDirectory } from "../../utils/initDirectory.js";


/**
 * Given a code, it will create a run file with code and run the command to run client application.
 * Tracing agent's runner will read the run file, get the code from the file, and run the code in 
 * client environment. Runner will also override tracing agent collector to write executed function IDs
 * in the run file.
*/
export const runCodeOnClientApplication = async (socketIOInstance, code) => {

    await initDirectory(EXECUTED_FUNCTION_PATH);

    const runFileId = v4()

    const runFileName = `${IDENTITY_TEMP_DIRECTORY}/${runFileId}.json`

    // create a run file with code
    // client code will consume this file
    try {
        await writeFileJSONPromised(runFileName, {
            functions_to_run: [
                {
                    execution_id: runFileId,
                    input_to_pass: null,
                    function_meta: null,
                    code,
                    action: "run_function",
                    context: null,
                }
            ]
        });
    } catch (e) {
        const errorMessage = `Could not create run file. ${e.toString()}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }





    let settings = await userSettingLoader.getSettings()

    const cwd = process.cwd();

    const url = (endpoint) => {
        return `${ENTITY_NAME_URL}/${endpoint}`
    }

    // Run tracing agent with run file
    const promise = new Promise((resolve, reject) => {
        console.info(`Executing command: cd "${cwd}"; ${settings.command} --runFile="${runFileId}"`)
        exec(`cd "${cwd}"; ${settings.command} --runFile="${runFileId}"`, (err, stdout, stderr) => {
            console.log(stdout.toString())
            if (err) {
                console.error(err)
                reject(err)
            }
            resolve()
        })
    })



    await promise


    const codeRun = await readJSONFilePromised(runFileName);
    const executedFunction = codeRun.functions_to_run[0].executed_function

    if (!executedFunction) {
        throw new Error("Client application did not set the executed function in the run file.")
    }

    await loader.createExecutedFunction(executedFunction);

    // tracing agent could not set the executed function ID(s) in the run file
    // probably because of an error
    

    // remove the temporary run file
    await fs.unlink(runFileName, (err) => {
        console.error(err)
    });

    // emit executed function ID
    socketIOInstance.emit(url("run_function_with_code:result"), executedFunction.id);

}

export const runFunctionWithInput = async (args = {}) => {

    const { name, fileName, packageName, environmentName, moduleName, inputToPass } = args

    const runFileId = v4()

    const runFileName = `${EXECUTED_FUNCTION_PATH}/${runFileId}.json`

    writeFileJSONPromised(runFileName, {
        name, fileName, packageName, environmentName, moduleName, inputToPass,
        type: "run_function"
    })

    const settings = await userSettingLoader.getSettings()

    const cwd = process.cwd();

    console.log(`executing cd "${cwd}"; ${settings.command} --runFile="${runFileId}"`)

    const promise = new Promise((resolve, reject) => {

        const result = exec(`cd "${cwd}"; ${settings.command} --runFile="${runFileId}"`, (err, stdout, stderr) => {
            console.log(stdout.toString())
            if (err) {
                console.error(err)
                return res.status(500).json({ error: err.message })
            }


            const functionRun = readJSONFilePromised(runFileName).then(functionRun => {
                fs.unlinkSync(runFileName)

                let functions = functionRun?.executedFunction?.data;


                const functionsToSave = getExecutedFunctionTreeFromExecutedFunctions(functions);

                return resolve({ executedFunction: functionsToSave[0] }) // TODO: think
            })

        })
    })

    return await promise
}


export const saveExecutedFunctions = async (functions) => {



    const functionsToSave = getExecutedFunctionTreeFromExecutedFunctions(functions)

    const promises = functionsToSave.map(f => loader.createExecutedFunction(f))

    return await Promise.all(promises)

}


export const getExecutedFunctionByID = async (id) => {
    return await loader.getExecutedFunctionByID(id)
}

export const getAllExecutedFunctions = async () => {
    return loader.getAllExecutedFunctions()
}
