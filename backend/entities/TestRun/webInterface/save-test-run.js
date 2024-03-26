import { saveFunctionExecutions } from "../../FunctionExecution/loader.js";
import { saveTestRun } from "../loader.js";




export const save_test_run = async (req, res) => {

    const body = req.body;

    const { traceID, environmentName, testCaseId } = body;
    if (body.type === 'function_trace') {
        let functions = body.data;
        functions = functions.map(f => ({ ...f, traceID, environmentName }))

        try {
            const functionExecution = await saveFunctionExecutions(functions);
            const rootFunction = functionExecution.find(f => !f.parentID)

            const testRun = await saveTestRun(testCaseId, rootFunction._id)

            res.json(testRun)

        } catch (e) {
            res.status(500).send(e?.toString())
        }
    }

}