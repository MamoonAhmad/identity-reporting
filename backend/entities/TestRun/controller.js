
import { v4 } from "uuid"
import { exec } from "child_process"
import { getExecutedFunctionTreeFromExecutedFunctions } from "../ExecutedFunction/utils.js"
import { getTestSuiteByID } from "../TestSuite/loader.js"
import * as loader from "./loader.js"
import * as testSuiteLoader from "../TestSuite/loader.js"
import * as userSettingLoader from "../UserSetting/loader.js"
import { ENTITY_NAME_URL, TEST_RUN_PATH } from "./constants.js";
import { IDENTITY_DIRECTORY } from "../../constants.js"




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



export const runTestSuits = (socketIOInstance, testSuiteIds = []) => {
    const url = (endpoint) => {
        return `${ENTITY_NAME_URL}/${endpoint}`
    }

    if (!testSuiteIds.length) {
        runAllTests(testResult => {
            socketIOInstance.emit(url('test_run_result'), testResult)
        }, (id) => socketIOInstance.emit(url("test_run_init"), id)).then(res => console.log(res))
    }
}


const runAllTests = async (onTestComplete = () => undefined, onInit) => {
    const testCaseDirectory = `${IDENTITY_DIRECTORY}/testCases/`

    const testIDS = (await testSuiteLoader.getAllTestSuits()).map(ts => ts._id);

    const testResults = []
    for (let a = 0; a < testIDS.length; a++) {
        onInit(testIDS[a]);
        await sleep()
        const testResult = await runTest(testIDS[a]);
        testResults.push(testResult);
        onTestComplete(testResult)
    }
    return testResults;
}
const runTest = async (testCaseId) => {


    let args = [];
    if (testCaseId) {
        args = [`--testCaseId="${testCaseId}"`]
    }

    const testRunPath = TEST_RUN_PATH
    const testRunId = v4()

    let settings = await userSettingLoader.getSettings()

    const cwd = process.cwd();
    console.log(`executing cd "${cwd}"; ${settings.command} --testSuiteId="${testCaseId}" --testRunId="${testRunId}"`)

    const promise = new Promise((resolve, reject) => {
        exec(`cd "${cwd}"; ${settings.command} --testSuiteId="${testCaseId}" --testRunId="${testRunId}"`, (err, stdout, stderr) => {
            console.log(stdout.toString())
            if (err) {
                console.error(err)
                reject(err)
            }

            const testRun = loader.getTestRunByID(testRunId);
            resolve(testRun)
        })
    })


    return await promise

}


const sleep = () => {
    return new Promise((resolve) => {
        setTimeout(() => { resolve(true) }, 1000)
    })
}
