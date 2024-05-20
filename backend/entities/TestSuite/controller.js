
import { v4 } from "uuid"
import * as loader from "./loader.js"




export const getAllTestSuits = async () => {
    return await loader.getAllTestSuits()
}

export const createOrUpdateTestSuite = async (testCaseConfig) => {

    let id = testCaseConfig._id;

    if (!testCaseConfig._id) {
        id = v4()
        testCaseConfig._id = id
    }

    let existingSuite = await loader.getTestSuiteByID(id)

    if (!existingSuite) {
        await loader.createTestSuite(testCaseConfig)

    } else {
        await loader.updateTestSuite({
            ...existingSuite,
            ...testCaseConfig
        })
    }
    existingSuite = await loader.getTestSuiteByID(id)

    return existingSuite

}

export const getTestSuiteByID = async (testCaseID) => {
    return await loader.getTestSuiteByID(testCaseID)
}

export const updateTestSuite = async (testSuite) => {
    return await loader.updateTestSuite(testSuite)
}

export const createTestSuite = async (testSuite) => {
    return await loader.createTestSuite(testSuite)
}

