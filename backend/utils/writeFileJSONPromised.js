import fs from "fs";


export const writeFileJSONPromised = (fileName, data) => {

    return new Promise((resolve, reject) => {
        try {
            fs.writeFileSync(fileName, JSON.stringify(data));
            resolve()
        } catch (e) {
            reject(e)
        }

    })

}