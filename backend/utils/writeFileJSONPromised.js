import fs from "fs";
import { logger } from "../logger.js";

/**
 * @param {String} fileName File name where the data should be written.
 * @param {Any} data Object that will stringified and stored in the file.
 * @param {Boolean} format Whether to format the stringified json.
 * @returns Promise which resolves when the file is written successfully.
 * Throws error on unsuccessful write operation.
 */
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