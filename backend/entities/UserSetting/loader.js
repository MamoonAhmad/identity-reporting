import fs from 'node:fs'
import { readJSONFilePromised } from "../../utils/readJSONFilePromised.js"
import { writeFileJSONPromised } from "../../utils/writeFileJSONPromised.js"
import { ERROR_CODES, throwError } from '../../errors.js'
import { validateUserSetting } from './validator.js'


let _cachedSettings = null;



export const getSettings = async () => {
    if (_cachedSettings) {
        return _cachedSettings
    }
    const res = await readJSONFilePromised(`identity_config.json`)
    validateUserSetting(res)
    _cachedSettings = res;
    return _cachedSettings;
}


export const updatesettings = async (settings) => {
    validateUserSetting(settings);
    _cachedSettings = settings;
    return writeFileJSONPromised(`identity_config.json`, settings, true)
}

export const assertConfigFileExists = () => {
    if (!fs.existsSync('identity_config.json')) {
        throwError(ERROR_CODES.CONFIG_FILE_NOT_FOUND);
    }
}