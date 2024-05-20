
import fs from "fs"


export const initDirectory = async (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
}