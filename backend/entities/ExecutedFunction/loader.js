import fs from "fs";
import path from "path";

import { initDirectory } from "../../utils/initDirectory.js";
import { readJSONFilePromised } from "../../utils/readJSONFilePromised.js";
import { writeFileJSONPromised } from "../../utils/writeFileJSONPromised.js"
import { EXECUTED_FUNCTION_PATH } from "./constants.js"
import { matchWithOperator } from "../../utils/loaderUtils.js";







export const createExecutedFunction = async (executedFunction = {}) => {

    initDirectory(EXECUTED_FUNCTION_PATH);

    const { id } = executedFunction;
    await writeFileJSONPromised(`${EXECUTED_FUNCTION_PATH}/${id}.json`, executedFunction);
    return executedFunction;
}

export const getExecutedFunctionByID = async (id) => {

    initDirectory(EXECUTED_FUNCTION_PATH);

    const executedFunctionFile = `${EXECUTED_FUNCTION_PATH}/${id}.json`
    if (!fs.existsSync(executedFunctionFile)) {
        return null
    }

    return readJSONFilePromised(executedFunctionFile)
}



export const getAllExecutedFunctions = async (filters) => {

    initDirectory(EXECUTED_FUNCTION_PATH);

    const files = fs.readdirSync(EXECUTED_FUNCTION_PATH)
    const fileNames = files.map(f => path.join(EXECUTED_FUNCTION_PATH, f))
    const results = []

    const promises = fileNames.map(fname => {
        return (async () => {
            const res = await readJSONFilePromised(fname)
            const shouldAdd = Object.keys(filters).
                every(propName => matchWithOperator(res, propName, filters[propName]))

            if (shouldAdd) {
                results.push(res);
            }

        })();
    })

    await promises;

    return results;

}
