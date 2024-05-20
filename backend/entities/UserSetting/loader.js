import { IDENTITY_DIRECTORY } from "../../constants.js"
import { readJSONFilePromised } from "../../utils/readJSONFilePromised.js"
import { writeFileJSONPromised } from "../../utils/writeFileJSONPromised.js"






export const getSettings = async () => {
    return readJSONFilePromised(`${IDENTITY_DIRECTORY}/config.json`)
}


export const updatesettings = async (settings) => {
    return writeFileJSONPromised(`${IDENTITY_DIRECTORY}/config.json`, settings)
}