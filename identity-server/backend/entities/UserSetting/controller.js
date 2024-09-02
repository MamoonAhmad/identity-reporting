
import * as loader from "./loader.js";



export const saveSettings = settings => loader.updatesettings(settings)
export const getSettings = () => loader.getSettings()