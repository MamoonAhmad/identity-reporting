import fs from "fs";

import { initDirectory } from "../../utils/initDirectory.js";
import { readJSONFilePromised } from "../../utils/readJSONFilePromised.js";
import { writeFileJSONPromised } from "../../utils/writeFileJSONPromised.js"
import { ENTITY_NAME, EXECUTED_FUNCTION_PATH } from "./constants.js"
import { logger } from "../../logger.js";
import { ERROR_CODES, throwError } from "../../errors.js";
import { FileIndex } from "../../utils/FileInex.js";
import { IDENTITY_DIRECTORY } from "../../constants.js";
import { getSettings } from "../UserSetting/loader.js";


const userSettings = await getSettings();

const INDEX_FILE_PATH = `${IDENTITY_DIRECTORY}/${ENTITY_NAME}/index.json`;

let EXECUTED_FUNCTION_INDEX = new FileIndex(
    ENTITY_NAME,
    INDEX_FILE_PATH,
    (res) => [res.id, res.name, res?.moduleName, res?.fileName],
    userSettings.max_executed_functions
);
await EXECUTED_FUNCTION_INDEX.initCache();


/**
 * Creates a new executed function and adds entry in the index file.
*/
export const createExecutedFunction = async (executedFunction = {}) => {

    initDirectory(EXECUTED_FUNCTION_PATH);

    // create the file first.
    const { id } = executedFunction;
    logger.debug("Creating executed function record", executedFunction)
    await writeFileJSONPromised(`${EXECUTED_FUNCTION_PATH}/${id}.json`, executedFunction);

    // add entry inside index file
    await EXECUTED_FUNCTION_INDEX.addRecord(executedFunction);
    
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

    await initDirectory(EXECUTED_FUNCTION_PATH);

    let filteredIDs = null;
    if (filters.name || filters.moduleName || filters.fileName) {
        filteredIDs = await EXECUTED_FUNCTION_INDEX.filter([
            filters.name,
            filters.moduleName,
            filters.fileName,
        ])
    } else {
        filteredIDs = EXECUTED_FUNCTION_INDEX.cache.map(i => i[0]);
    }

    const promises = filteredIDs.map(id => getExecutedFunctionByID(id));
    return (await Promise.all(promises)).filter(res => !!res);


}

/**
 * Removes entry from the index file and removes the function file from the directory.
*/
export const deleteExecutedFunction = async (id) => {

    initDirectory(EXECUTED_FUNCTION_PATH);

    const executedFunction = await getExecutedFunctionByID(id);
    if (!executedFunction) {
        logger.debug(`Trying to delete executed function with invalid id ${id}.`)
    }
    
    // Delete entry from the index file.
    await EXECUTED_FUNCTION_INDEX.deleteRecord(executedFunction);

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
