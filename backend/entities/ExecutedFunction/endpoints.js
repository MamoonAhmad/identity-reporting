import { processRunFileSignal } from "../../runFileSignals.js"
import { expressEndpointResolver } from "../../utils/expressEndpointResolver.js"
import { socketIOResolverFactory } from "../../utils/socketIOResolverFactory.js"
import { ENTITY_NAME_URL } from "./constants.js"
import { getAllExecutedFunctions, getExecutedFunctionByID, runCodeOnClientApplication, runFunctionWithInput, saveExecutedFunctions } from "./controller.js"




export const registerExpressEndpoints = (app) => {
    const url = (endpoint) => {
        return `/${ENTITY_NAME_URL}/${endpoint}`
    }

    app.post(url("save-function-execution-trace"), expressEndpointResolver((req => {
        const functions = req.body?.data;
        return saveExecutedFunctions(functions);
    })))
    app.post(url("client-function-run-signal"), expressEndpointResolver((req, res) => {
        const executionID = req.body?.execution_id
        const runFileID = req.body?.run_file_id
        processRunFileSignal(runFileID, executionID).catch((e) => console.error(e))
    }))
    app.post(url('run-function-with-input'), expressEndpointResolver(req => runFunctionWithInput(req.body)));
    app.get(url("get-executed-functions"), expressEndpointResolver(getAllExecutedFunctions))
    app.get(url('get-executed-function/:id'), expressEndpointResolver((req) => getExecutedFunctionByID(req.params.id)))
}

export const registerSocketEndpoints = (socketIOInstance, socket) => {
    const url = (endpoint) => {
        return `${ENTITY_NAME_URL}/${endpoint}`
    }

    socket.on(...socketIOResolverFactory({
        endpoint: url('run_function_with_code'),
        functionToRun: code => runCodeOnClientApplication(socketIOInstance, code),
        socketIOInstance,
        socket
    }))

}