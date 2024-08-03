import { getExecutedFunctionTreeFromExecutedFunctions } from "../ExecutedFunction/utils.js"
import { getTestSuiteByID } from "../TestSuite/loader.js"
import * as loader from "./loader.js"
import { runTestsOnClientApp } from "../../clientApp.js"


export const getAllTestRuns = () => loader.getAllTestRuns()


export const getTestRunByID = (id) => loader.getTestRunByID(id)


export const saveTestRun = async (body) => {

    const { traceID, environmentName, testSuiteId, testCaseId, testRunId } = body;

    let functions = body.data;

    const functionsToSave = getExecutedFunctionTreeFromExecutedFunctions(functions);

    const testSuite = await getTestSuiteByID(testSuiteId);



    let testRun = await loader.getTestRunByID(testRunId);
    if (!testRun) {
        testRun = { ...testSuite, _id: testRunId, testSuiteID: testSuiteId }
    }


    const testCase = testRun.tests?.find(tc => tc.id === testCaseId)
    if (!testCase) {
        throw new Error("Invalid test case id.")
    }

    testCase.executedFunction = functionsToSave[0]

    await loader.updateTestRun(testRun);

    return testRun;

}



export const runTestSuits = async (socketIOInstance, filter) => {


    const onTestComplete = (testSuiteMatcherResult) => {
        socketIOInstance.emit("test_run/test_run_result", testSuiteMatcherResult)
    }

    await runTestsOnClientApp({
        functionName: filter?.functionName,
        name: filter?.name,
        moduleName: filter?.moduleName,
    }, onTestComplete)

}
