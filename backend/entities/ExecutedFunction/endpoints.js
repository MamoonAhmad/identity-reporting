import { expressEndpointResolver } from "../../utils/expressEndpointResolver.js"
import { ENTITY_NAME_URL } from "./constants.js"
import { getAllExecutedFunctions, getExecutedFunctionByID, runFunctionWithInput, saveExecutedFunctions } from "./controller.js"




export const registerExpressEndpoints = (app) => {
    const url = (endpoint) => {
        return `/${ENTITY_NAME_URL}/${endpoint}`
    }

    app.post(url("save-function-execution-trace"), expressEndpointResolver((req => {
        const functions = req.body?.data;
        return saveExecutedFunctions(functions);
    })))
    app.post(url('run-function-with-input'), expressEndpointResolver(req => runFunctionWithInput(req.body)));
    app.get(url("get-executed-functions"), expressEndpointResolver(getAllExecutedFunctions))
    app.get(url('get-executed-function/:id'), expressEndpointResolver((req) => getExecutedFunctionByID(req.params.id)))
}