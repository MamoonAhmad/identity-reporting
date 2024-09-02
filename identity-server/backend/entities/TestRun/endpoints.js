import { logger } from "../../logger.js"
import { ENTITY_NAME, ENTITY_NAME_URL } from "./constants.js"
import { runTestSuits, } from "./controller.js"


export const registerSocketEndpoints = (socketIOInstance, socket) => {
    logger.debug(`Registering socket endpoints for ${ENTITY_NAME}`)

    const url = (endpoint) => {
        return `${ENTITY_NAME_URL}/${endpoint}`
    }


    return {
        [url('run_test')]: async (socketServerInstance, socket, { payload }) => {
            const { filter } = payload
            return runTestSuits(socket, filter)
        }
    }
}