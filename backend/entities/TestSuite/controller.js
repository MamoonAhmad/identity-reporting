
import { v4 } from "uuid"
import * as loader from "./loader.js"



export const getAllTestSuits = async (req, res) => {
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
    return await loader.getAllTestSuits(filters)
}

export const createOrUpdateTestSuite = async (testCaseConfig) => {

    let id = testCaseConfig.id;

    if (!testCaseConfig.id) {
        id = v4()
        testCaseConfig.id = id
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

export const deleteTestSuite = (id) => loader.deleteTestSuite(id)

