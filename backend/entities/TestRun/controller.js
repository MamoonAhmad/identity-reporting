
import { v4 } from "uuid"
import { exec } from "child_process"
import { getExecutedFunctionTreeFromExecutedFunctions } from "../ExecutedFunction/utils.js"
import { getTestSuiteByID } from "../TestSuite/loader.js"
import * as loader from "./loader.js"
import * as testSuiteLoader from "../TestSuite/loader.js"
import * as userSettingLoader from "../UserSetting/loader.js"
import { ENTITY_NAME_URL, TEST_RUN_PATH } from "./constants.js";
import { IDENTITY_DIRECTORY, IDENTITY_TEMP_DIRECTORY } from "../../constants.js"
import { matchExecutionWithTestConfig } from "./matcher.js"
import { writeFileJSONPromised } from "../../utils/writeFileJSONPromised.js"
import { runFunctionsOnClientApp, runTestsOnClientApp } from "../../clientApp.js"

const url = (endpoint) => {
    return `${ENTITY_NAME_URL}/${endpoint}`
}


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
