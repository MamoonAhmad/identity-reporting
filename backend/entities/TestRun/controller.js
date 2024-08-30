import { runTestsOnClientApp } from "../../clientApp.js"
import { logger } from "../../logger.js"
import { SOCKET_EVENTS } from "./constants.js"

/**
 * Runs test on client app. Emits the test result to the socket when a test run completes.
*/
export const runTestSuits = async (socketIOInstance, filter) => {


    const onTestComplete = (testSuiteMatcherResult) => {
        socketIOInstance.emit(SOCKET_EVENTS.TEST_SUITE_RESULT, testSuiteMatcherResult)
    }


    const filters = {
        functionName: filter?.functionName,
        name: filter?.name,
        moduleName: filter?.moduleName,
    }

    logger.debug("Running tests on client app with filters", filters)
    await runTestsOnClientApp(filters, onTestComplete)
    await socketIOInstance.close();

}
