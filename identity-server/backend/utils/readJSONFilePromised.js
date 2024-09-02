import fs from "fs";


/**
 * Reads a json file and parses the json. Returns a promise
*/
export const readJSONFilePromised = (fileName) => {
    return new Promise((resolve, reject) => {
        try {
            const res = fs.readFileSync(fileName)
            resolve(JSON.parse(res.toString()))
        } catch (e) {
            reject(e)
        }
    })
}