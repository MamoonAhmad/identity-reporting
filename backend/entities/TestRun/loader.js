import { getParentFunctionWithChildren } from "../FunctionExecution/loader.js"
import { getTestCaseById } from "../TestCase/loader.js"
import { TestRunModel } from "./models.js"





export const saveTestRun = async (testCaseId, executedFunctionId) => {
    const testRun = new TestRunModel({ testCaseId, executedFunctionId })
    await testRun.save()
    return testRun
}

export const getTestRunById = async (id) => {
    const testRun = await TestRunModel.findById(id)
    const testCase = await getTestCaseById(testRun.testCaseId)
    const executedFunction = await getParentFunctionWithChildren(testRun.executedFunctionId)
    return {
        ...testRun,
        _id: testRun._id,
        testCase,
        executedFunction
    }
}


export const getAllTestRuns = async ({ testCaseId = null }) => {
    let promise;
    if (testCaseId) {
        promise = TestRunModel.find({ testCaseId })
    } else {
        promise = TestRunModel.find()
    }
    const res = await promise;
    const promises = res.map(f => getTestRunById(f._id))
    const result = await Promise.all(promises)
    return result
}