
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

    // const filters = {};
    // if (filter?.fileName) {
    //     filters.fileName = {
    //         contains: filter?.fileName
    //     }
    // }
    // if (filter?.moduleName) {
    //     filters.moduleName = {
    //         contains: filter?.moduleName
    //     }
    // }
    // if (filter?.name) {
    //     filters.name = {
    //         contains: filter?.name
    //     }
    // }

    // await runAllTests(socketIOInstance, filters, testResult => {
    //     socketIOInstance.emit("test_run/test_run_result", testResult)
    // }, (id) => socketIOInstance.emit(url("test_run_init"), id)).then(res => console.log(res))

}


const runAllTests = async (socket, filters, onTestComplete = () => undefined, onInit) => {

    const testIDS = (await testSuiteLoader.getAllTestSuits(filters)).map(ts => ts.id);

    socket.emit(url("run_test:stats"), {
        total: testIDS.length
    })

    const testResults = []
    for (let a = 0; a < testIDS.length; a++) {
        onInit(testIDS[a]);
        // await sleep()
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




    const visit = (functionTestConfig, mocks = {}) => {
        if (functionTestConfig.isMocked) {
            const key = `${functionTestConfig.functionMeta.moduleName}:${functionTestConfig.functionMeta.name}`
            if (!mocks[key]) {
                mocks[key] = {}
            }
            mocks[key][functionTestConfig.functionCallCount] = {
                errorToThrow: functionTestConfig.mockedErrorMessage,
                output: functionTestConfig.mockedOutput
            }
        }
        if (functionTestConfig.children.length) {
            functionTestConfig.children.forEach(c => visit(c, mocks))
        }
        return mocks
    }
    const runFileID = v4();

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
                mocks: visit(testCase.config),
                testSuiteID: testCaseId,
                testCaseID: testCase.id,
            }
        }
    }));

    const traces = await runFunctionsOnClientApp(functionsToRun)

    const testResult = { ...testSuite }
    testResult.tests.forEach((tc, i) => {
        tc.executedFunction = traces[i]
    })

    const matcherResult = matchExecutionWithTestConfig(testResult);
    matcherResult.testSuiteID = testCaseId
    // socketIOInstance.emit(url('test_run_result'), matcherResult)
    return matcherResult

    // let args = [];
    // if (testCaseId) {
    //     args = [`--testCaseId="${testCaseId}"`]
    // }

    // let settings = await userSettingLoader.getSettings()

    // const runFilePath = `${IDENTITY_TEMP_DIRECTORY}/${runFileID}.json`;




    // const runFileConfig = {
    //     functions_to_run: functionsToRun
    // }

    // if (signalEndpoint) {
    //     runFileConfig.signal_endpoint = signalEndpoint
    // }

    // await writeFileJSONPromised(runFilePath, runFileConfig)

    // const cwd = process.cwd();
    // const commandToExecute = `cd "${cwd}"; ${settings.command} --runFile="${runFileID}"`
    // console.log(`executing ${commandToExecute}`)

    // const promise = new Promise((resolve, reject) => {
    //     exec(commandToExecute, (err, stdout, stderr) => {
    //         console.log(stdout.toString())
    //         if (err) {
    //             console.error(err)
    //             reject(err)
    //         }

    //         resolve()
    //     })
    // })

    // try {
    //     return await promise
    // } catch (e) {
    //     return {
    //         testCaseName: testSuite.name,
    //         testCaseDescription: testSuite.description,
    //         functionMeta: testSuite.functionMeta,
    //         testSuiteID: testCaseId,
    //         successful: false,
    //         error: e?.toString()
    //     };
    // }


}


const sleep = () => {
    return new Promise((resolve) => {
        setTimeout(() => { resolve(true) }, 10000)
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


    if (testSuite.tests.length !== functionRuns.length) {
        return
    }

    // If all the test cases have been executed for the test suite
    // create a result file

    const testResult = { ...testSuite }
    functionRuns.forEach(fc => {
        const testCase = testResult.tests.find(tc => tc.id === fc.context.test_run.testCaseID)
        testCase.executedFunction = fc.executed_function
    })

    const matcherResult = matchExecutionWithTestConfig(testResult);
    matcherResult.testSuiteID = testSuiteID
    socketIOInstance.emit(url('test_run_result'), matcherResult)

}