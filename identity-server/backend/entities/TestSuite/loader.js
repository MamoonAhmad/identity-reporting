import fs from "fs";
import { v4 as uuidv4 } from "uuid"

import { IDENTITY_DIRECTORY } from "../../constants.js"
import { initDirectory } from "../../utils/initDirectory.js"
import { readJSONFilePromised } from "../../utils/readJSONFilePromised.js"
import { ENTITY_NAME } from "./constants.js"
import { writeFileJSONPromised } from "../../utils/writeFileJSONPromised.js";
import { logger } from "../../logger.js";
import { ERROR_CODES, throwError } from "../../errors.js";
import { FileIndex } from "../../utils/FileInex.js";




const testCasePath = `${IDENTITY_DIRECTORY}/${ENTITY_NAME}`
const INDEX_FILE_PATH = `${testCasePath}/index.json`;

let TEST_SUITE_INDEX_FILE_CONTENT = new FileIndex(
    ENTITY_NAME,
    INDEX_FILE_PATH,
    (res) => [res.id, res.name, res.functionMeta?.moduleName, res.functionMeta?.fileName]
);
await TEST_SUITE_INDEX_FILE_CONTENT.initCache();

export const getAllTestSuits = async (filters = {}) => {

    await initDirectory(testCasePath);


    // const testSuiteIndex = await getTestSuiteIndex();

    let filteredIDs;
    if (filters.name || filters.moduleName || filters.fileName) {
        filteredIDs = await TEST_SUITE_INDEX_FILE_CONTENT.filter([
            filters.name,
            filters.moduleName,
            filters.fileName
        ])

    } else {
        filteredIDs = TEST_SUITE_INDEX_FILE_CONTENT.cache.map(i => i[0]);
    }

    const promises = filteredIDs.map((id) => {
        return getTestSuiteByID(id);
    })


    return await Promise.all(promises);
}

export const getTestSuiteByID = async (testSuiteID) => {

    const testSuiteFile = `${testCasePath}/${testSuiteID}.json`
    if (!fs.existsSync(testSuiteFile)) {
        return null
    }

    return await readJSONFilePromised(testSuiteFile)
}


export const updateTestSuite = async (testSuite) => {
    await initDirectory(testCasePath);
    const testSuiteID = testSuite.id
    const testSuiteFile = `${testCasePath}/${testSuiteID}.json`

    logger.debug("Updating test suite.", testSuite)
    try {
        await writeFileJSONPromised(testSuiteFile, testSuite);
    } catch (e) {
        throwError(ERROR_CODES.EXTERNAL_ERROR, { message: `Could not update test suite. ${e?.toString()}` })
    }

    // update the index file entry as well.
    await TEST_SUITE_INDEX_FILE_CONTENT.updateRecord(testSuite);

}

/**
 * Creates a test suite file and adds entry in the index file.
*/
export const createTestSuite = async (testSuite) => {
    await initDirectory(testCasePath);
    const testSuiteID = testSuite.id || uuidv4();

    if (!testSuite.id) {
        testSuite.id = testSuiteID;
    }

    logger.debug("Creating new test suite.", testSuite)

    const testSuiteFile = `${testCasePath}/${testSuiteID}.json`

    if (fs.existsSync(testSuiteFile)) {
        throw new Error(`Test suite ${testSuiteID} already exists.`)
    }

    // create a new test suite file.
    try {
        await writeFileJSONPromised(testSuiteFile, testSuite);
        logger.debug(`Created file fo test suite ${testSuiteFile}`)
    } catch (e) {
        throwError(
            ERROR_CODES.EXTERNAL_ERROR,
            { message: `Could not create test suite. ${e?.toString()}` }
        )
    }

    // add entry in index file
    await TEST_SUITE_INDEX_FILE_CONTENT.addRecord(testSuite);

}

export const deleteTestSuite = async (id) => {

    const testSuite = await getTestSuiteByID(id)

    // remove entry from the index file.
    await TEST_SUITE_INDEX_FILE_CONTENT.deleteRecord(testSuite);

    const testSuiteFile = `${testCasePath}/${indexEntry[0]}.json`


    const promise = new Promise((resolve, reject) => {
        fs.unlink(testSuiteFile, (err) => {
            if (err) {
                reject(err)
            }
            resolve();
        })
    });

    try {
        logger.debug(`Deleting test suite file ${id}.`)
        await promise;
    } catch (e) {
        logger.error(`Could not delete test suite. ${e?.toString()}`)
    }
}
