import fs from "fs";
import path from "path";

import { initDirectory } from "../../utils/initDirectory.js";
import { readJSONFilePromised } from "../../utils/readJSONFilePromised.js";
import { writeFileJSONPromised } from "../../utils/writeFileJSONPromised.js"
import { EXECUTED_FUNCTION_PATH } from "./constants.js"
import { matchWithOperator } from "../../utils/loaderUtils.js";
import { logger } from "../../logger.js";
import { ERROR_CODES, throwError } from "../../errors.js";







export const createExecutedFunction = async (executedFunction = {}) => {

    initDirectory(EXECUTED_FUNCTION_PATH);

    const { id } = executedFunction;
    logger.debug("Creating executed function record", executedFunction)
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

export const deleteExecutedFunction = async (id) => {

    initDirectory(EXECUTED_FUNCTION_PATH);

    const executedFunctionFile = `${EXECUTED_FUNCTION_PATH}/${id}.json`
    if (!fs.existsSync(executedFunctionFile)) {
        logger.debug(`Executed function ${id} does not exist. Trying to delete the function with invalid id.`)
        return null
    }
    const promise = new Promise((resolve, reject) => {
        fs.unlink(executedFunctionFile, (err) => {
            if (err) {
                reject(err)
            }
            resolve();
        })
    })
    try {
        logger.debug(`Deleting executed function ${id}.`)
        await promise;

    } catch (e) {
        throwError(ERROR_CODES.EXTERNAL_ERROR, { message: `Could not delete executed function. ${e?.toString()}` })
    }
}
