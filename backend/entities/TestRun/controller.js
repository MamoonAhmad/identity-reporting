
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



export const runTestSuits = (socketIOInstance, testSuiteIds = []) => {

    if (!testSuiteIds.length) {
        runAllTests(testResult => {
            console.log(testResult);
        }, (id) => socketIOInstance.emit(url("test_run_init"), id)).then(res => console.log(res))
    }
}


const runAllTests = async (onTestComplete = () => undefined, onInit) => {
    const testCaseDirectory = `${IDENTITY_DIRECTORY}/testCases/`

    const testIDS = (await testSuiteLoader.getAllTestSuits()).map(ts => ts.id);

    const testResults = []
    for (let a = 0; a < testIDS.length; a++) {
        onInit(testIDS[a]);
        await sleep()
        const testResult = await runTestSuite(testIDS[a], "http://localhost:8002/executed_function/client-function-run-signal/");
        testResults.push(testResult);
        onTestComplete(testResult)
    }
    return testResults;
}
/**
 * creates a run file and calls the client app to run functions in test run mode.
 * For every test case in the test suite, it will create a function config.
*/
const runTestSuite = async (testCaseId, signalEndpoint) => {

    const runFileID = v4();

    // let args = [];
    // if (testCaseId) {
    //     args = [`--testCaseId="${testCaseId}"`]
    // }

    let settings = await userSettingLoader.getSettings()

    const runFilePath = `${IDENTITY_TEMP_DIRECTORY}/${runFileID}.json`;

    const testSuite = await testSuiteLoader.getTestSuiteByID(testCaseId)
    const functionsToRun = testSuite.tests.map(testCase => ({
        execution_id: v4(),
        input_to_pass: testCase.inputToPass,
        function_meta: {
            module_name: testCase.config.functionMeta.moduleName,
            file_name: testCase.config.functionMeta.fileName,
            function_name: testCase.config.functionMeta.name
        },
        action: "test_run",
        context: {
            test_run: {
                mocks: testCase.mocks,
                testSuiteID: testCaseId,
                testCaseID: testCase.id,
            }
        }
    }));

    const runFileConfig = {
        functions_to_run: functionsToRun
    }

    if(signalEndpoint) {
        runFileConfig.signal_endpoint = signalEndpoint
    }

    await writeFileJSONPromised(runFilePath, runFileConfig)

    const cwd = process.cwd();
    const commandToExecute = `cd "${cwd}"; ${settings.command} --runFile="${runFileID}"`
    console.log(`executing ${commandToExecute}`)

    const promise = new Promise((resolve, reject) => {
        exec(commandToExecute, (err, stdout, stderr) => {
            console.log(stdout.toString())
            if (err) {
                console.error(err)
                reject(err)
            }
            
            resolve()
        })
    })

    return await promise

}


const sleep = () => {
    return new Promise((resolve) => {
        setTimeout(() => { resolve(true) }, 1000)
    })
}


export const processFunctionConfigForRunFileSignal = async (socketIOInstance, runFileConfig, functionConfig) => {

    const { testSuiteID, testCaseID } = functionConfig.context.test_run || {};

    if (!testSuiteID) {
        throw new Error("Test suite ID not set the function config context.")
    }

    if (!testCaseID) {
        throw new Error("Test case ID not set the function config context.")
    }

    const testSuite = await testSuiteLoader.getTestSuiteByID(testSuiteID)
    if (!testSuite) {
        throw new Error("Invalid test suite ID in the function config context.")
    }
    const testCase = testSuite.tests.find(testCase => testCase.id === testCaseID)
    if (!testCase) {
        throw new Error("Invalid test case ID in the function config context.")
    }

    const functionRuns = runFileConfig.functions_to_run.filter(
        fc => fc.context.test_run.testSuiteID === testSuiteID
    )

    
    if(testSuite.tests.length !== functionRuns.length) {
        return
    }

    // If all the test cases have been executed for the test suite
    // create a result file

    const testResult = {...testSuite}
    functionRuns.forEach(fc => {
        const testCase = testResult.tests.find(tc => tc.id === fc.context.test_run.testCaseID)
        testCase.executedFunction = fc.executed_function
    })

    const matcherResult = matchExecutionWithTestConfig(testResult);
    matcherResult.testSuiteID = testSuiteID
    socketIOInstance.emit(url('test_run_result'), matcherResult)

}