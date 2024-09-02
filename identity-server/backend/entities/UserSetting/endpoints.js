import { logger } from "../../logger.js"
import { expressEndpointResolver } from "../../utils/expressEndpointResolver.js"
import { ENTITY_NAME, ENTITY_NAME_URL } from "./constants.js"
import { getSettings, saveSettings } from "./controller.js"




export const registerExpressEndpoints = (app) => {
    logger.debug(`Registering endpoints for ${ENTITY_NAME}`)
    const url = (endpoint) => {
        return `/${ENTITY_NAME_URL}/${endpoint}`
    }
    app.get(url("get-settings"), expressEndpointResolver(getSettings))
    app.post(url("save-settings"), expressEndpointResolver(req => saveSettings(req.body)))
}