import { IDENTITY_TEMP_DIRECTORY } from "./constants.js"
import { readJSONFilePromised } from "./utils/readJSONFilePromised.js"


const runFileActionListenerMap = {}

export const registerRunFileActionListener = (actionName, callback) => {
    runFileActionListenerMap[actionName] = callback
}

export const processRunFileSignal = async (runFileID, executionID) => {
    const runFileConfig = await readJSONFilePromised(
        `${IDENTITY_TEMP_DIRECTORY}/${runFileID}.json`
    )
    const functionConfig = runFileConfig.functions_to_run.find(
        functionConfig => functionConfig.execution_id === executionID
    )

    if (runFileActionListenerMap[functionConfig.action]) {
        const callback = runFileActionListenerMap[functionConfig.action]
        try {
            await callback(runFileConfig, functionConfig)
        } catch (e) {
            console.error(`Run File Signal Failed to process. Run File ID: ${runFileID}. Function Execution ID: ${executionID}. Error: ${e?.toString()}`)
        }

    }
}