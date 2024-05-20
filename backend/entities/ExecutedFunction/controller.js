import { v4 } from "uuid"
import fs from "fs"
import * as loader from "./loader.js";
import * as userSettingLoader from "../UserSetting/loader.js"
import { getExecutedFunctionTreeFromExecutedFunctions } from "./utils.js";
import { EXECUTED_FUNCTION_PATH } from "./constants.js";
import { IDENTITY_DIRECTORY } from "../../constants.js";
import { writeFileJSONPromised } from "../../utils/writeFileJSONPromised.js";
import { readJSONFilePromised } from "../../utils/readJSONFilePromised.js";
import { exec } from "child_process";



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