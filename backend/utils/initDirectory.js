
import fs from "fs"
import { ERROR_CODES, throwError } from "../errors.js";

/**
 * creates a directory
*/
export const initDirectory = async (directory) => {
    if (!fs.existsSync(directory)) {
        try {
            await fs.mkdir(directory);
        } catch (e) {
            throwError(ERROR_CODES.EXTERNAL_ERROR, { message: `Could not create identity directory in the root of project. ${e?.toString() || ""}` })
        }

    }
}