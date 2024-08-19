import { runTestsOnClientApp } from "../../clientApp.js"
import { logger } from "../../logger.js"


export const runTestSuits = async (socketIOInstance, filter) => {


    const onTestComplete = (testSuiteMatcherResult) => {
        socketIOInstance.emit("test_run/test_run_result", testSuiteMatcherResult)
    }


    const filters = {
        functionName: filter?.functionName,
        name: filter?.name,
        moduleName: filter?.moduleName,
    }

    logger.debug("Running tests on client app with filters", filters)
    await runTestsOnClientApp(filters, onTestComplete)

}
