import { saveFunctionExecutions } from "../loader.js";


export default async function traceFunctionExecution(req, res) {

    const body = req.body;

    const { traceID, environmentName } = body;
    if (body.type === 'function_trace') {
        let functions = body.data;
        functions = functions.map(f => ({ ...f, traceID, environmentName }))

        try {
            const functionExecution = await saveFunctionExecutions(functions);
            res.json(functionExecution)
        } catch (e) {
            res.status(500).send(e?.toString())
        }
    }



}