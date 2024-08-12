import fs from "fs";
import { logger } from "../logger.js";


export const writeFileJSONPromised = (fileName, data, format = false) => {

    return new Promise((resolve, reject) => {
        try {
            logger.debug(`Writing to file ${fileName}.`)
            fs.writeFileSync(fileName, JSON.stringify(data, undefined, format ? 4 : undefined));
            resolve()
        } catch (e) {
            logger.error(e)
            reject(e)
        }

    })

}