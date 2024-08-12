import { logger } from "../../logger.js"
import { expressEndpointResolver } from "../../utils/expressEndpointResolver.js"
import { ENTITY_NAME_URL } from "./constants.js"
import { createOrUpdateTestSuite, getAllTestSuits, getTestSuiteByID } from "./controller.js"





export const registerExpressEndpoints = (app) => {
    logger.debug("Registering endpoints for TestSuite")
    const url = (endpoint) => {
        return `/${ENTITY_NAME_URL}/${endpoint}`
    }

    app.get(url("test-cases"), expressEndpointResolver(getAllTestSuits))
    app.post(url("save-test-case"), expressEndpointResolver((req) => {
        return createOrUpdateTestSuite(req.body)
    }))
    app.get(url('get-test-case/:id'), expressEndpointResolver((req) => getTestSuiteByID(req.params.id)))

}