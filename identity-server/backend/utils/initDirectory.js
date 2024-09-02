
import fs from "fs"
import { ERROR_CODES, throwError } from "../errors.js";

/**
 * creates a directory
*/
export const initDirectory = async (directory) => {
    if (!fs.existsSync(directory)) {
        return new Promise((resolve, reject) => {
            fs.mkdir(directory, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        })
    }
}