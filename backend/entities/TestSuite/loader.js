import fs from "fs";
import { v4 as uuidv4 } from "uuid"
import path from "path";

import { IDENTITY_DIRECTORY } from "../../constants.js"
import { initDirectory } from "../../utils/initDirectory.js"
import { readJSONFilePromised } from "../../utils/readJSONFilePromised.js"
import { ENTITY_NAME } from "./constants.js"
import { writeFileJSONPromised } from "../../utils/writeFileJSONPromised.js";




const testCasePath = `${IDENTITY_DIRECTORY}/${ENTITY_NAME}`

export const getAllTestSuits = async () => {

    initDirectory(testCasePath);

    const files = fs.readdirSync(testCasePath)
    const fileNames = files.map(f => path.join(testCasePath, f))
    const promises = fileNames.map(fname => {
        return readJSONFilePromised(fname)
    })
    const result = await Promise.all(promises)
    return result
}

export const getTestSuiteByID = async (testSuiteID) => {

    const testSuiteFile = `${testCasePath}/${testSuiteID}.json`
    if (!fs.existsSync(testSuiteFile)) {
        return null
    }

    return await readJSONFilePromised(testSuiteFile)
}


export const updateTestSuite = async (testSuite) => {
    const testSuiteID = testSuite.id
    const testSuiteFile = `${testCasePath}/${testSuiteID}.json`

    try {
        await writeFileJSONPromised(testSuiteFile, testSuite);
    } catch (e) {
        throw new Error(`Could not update test suite. ${e?.toString()}`)
    }

}


export const createTestSuite = async (testSuite) => {
    const testSuiteID = testSuite.id || uuidv4();

    if (!testSuite.id) {
        testSuite.id = testSuiteID;
    }

    const testSuiteFile = `${testCasePath}/${testSuiteID}.json`

    if (fs.existsSync(testSuiteFile)) {
        throw new Error(`Test suite ${testSuiteID} already exists.`)
    }

    try {
        await writeFileJSONPromised(testSuiteFile, testSuite);
    } catch (e) {
        throw new Error(`Could not create test suite. ${e?.toString()}`)
    }

}

