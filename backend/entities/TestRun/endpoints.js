import { expressEndpointResolver } from "../../utils/expressEndpointResolver.js"
import { socketIOResolverFactory } from "../../utils/socketIOResolverFactory.js"
import { ENTITY_NAME_URL } from "./constants.js"
import { getAllTestRuns, getTestRunByID, runTestSuits, saveTestRun } from "./controller.js"




export const registerExpressEndpoints = (app) => {
    const url = (endpoint) => {
        return `/${ENTITY_NAME_URL}/${endpoint}`
    }

    app.get(url('get-test-runs'), expressEndpointResolver(getAllTestRuns))
    app.get(url('get-test-run/:id'), expressEndpointResolver(req => getTestRunByID(req.params.id)))
    app.post(url('save-test-run'), expressEndpointResolver(req => saveTestRun(req.body)))

}

export const registerSocketEndpoints = (socketIOInstance, socket) => {
    const url = (endpoint) => {
        return `${ENTITY_NAME_URL}/${endpoint}`
    }

    socket.on(...socketIOResolverFactory(url('run_test'), testCaseIds => runTestSuits(socketIOInstance, testCaseIds)))

}