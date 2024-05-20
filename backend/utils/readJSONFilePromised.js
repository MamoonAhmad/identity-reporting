import fs from "fs";



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