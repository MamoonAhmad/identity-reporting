import registerFunctionExecutionEndpoints from "./entities/FunctionExecution/webInterface/index.js";
import registerTestCaseEndpoints from "./entities/TestCase/webInterface/index.js";
import registerTestRunEndpoints from "./entities/TestRun/webInterface/index.js";





export default function registerEndpoints(app) {
    registerFunctionExecutionEndpoints(app);
    registerTestCaseEndpoints(app)
    registerTestRunEndpoints(app)
}