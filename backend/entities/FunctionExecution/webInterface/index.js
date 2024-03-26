import { get_executed_function } from "./get-executed-function.js"
import { get_executed_functions } from "./get-executed-functions.js"
import traceFunctionExecution from "./trace-function-execution.js"



export default function registerFunctionExecutionEndpoints (app) {

    app.post('/save-function-execution-trace', traceFunctionExecution)

    app.get('/get-executed-functions', get_executed_functions)

    app.get('/get-executed-function/:id', get_executed_function)

}