import fs from "fs";
import path from "path";

import { initDirectory } from "../../utils/initDirectory.js";
import { readJSONFilePromised } from "../../utils/readJSONFilePromised.js";
import { writeFileJSONPromised } from "../../utils/writeFileJSONPromised.js"
import { TEST_RUN_PATH } from "./constants.js"







export const createTestRun = async (testRun = {}) => {

    initDirectory(TEST_RUN_PATH);

    const { _id } = testRun

    await writeFileJSONPromised(`${TEST_RUN_PATH}/${_id}.json`, testRun);
    return testRun;
}


export const getTestRunByID = async (id) => {

    initDirectory(TEST_RUN_PATH);

    const testRunFile = `${TEST_RUN_PATH}/${id}.json`
    if (!fs.existsSync(testRunFile)) {
        return null
    }

    return readJSONFilePromised(testRunFile)
}



export const getAllTestRuns = async () => {

    initDirectory(TEST_RUN_PATH);

    const files = fs.readdirSync(TEST_RUN_PATH)
    const fileNames = files.map(f => path.join(TEST_RUN_PATH, f))
    const promises = fileNames.map(fname => {
        return readJSONFilePromised(fname)
    })
    const result = await Promise.all(promises)
    return result
}

export const updateTestRun = async (testRun = {}) => {
    const { _id } = testRun

    const existingTestRun = getTestRunByID(_id);

    if (!existingTestRun) {
        // throw
    }

    const newTestRun = {
        ...existingTestRun,
        ...testRun
    }
    await writeFileJSONPromised(`${TEST_RUN_PATH}/${_id}.json`, newTestRun)

    return newTestRun
}