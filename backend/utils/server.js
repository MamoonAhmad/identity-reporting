import { logger } from "../logger.js"




// Logs the url requested by the user.
export const urlLoggerMiddleware = (req, _, next) => {
    logger.log(`${req.method} ${req.url}`)
    next()
}