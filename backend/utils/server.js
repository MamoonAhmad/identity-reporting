import { logger } from "../logger.js"





export const urlLoggerMiddleware = (req, _, next) => {
    logger.log(`${req.method} ${req.url}`)
    next()
}