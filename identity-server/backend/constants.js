import { initDirectory } from "./utils/initDirectory.js";

export const IDENTITY_DIRECTORY = "__identity__"
export const IDENTITY_TEMP_DIRECTORY = `${IDENTITY_DIRECTORY}/__temp__`;

initDirectory(IDENTITY_DIRECTORY)
initDirectory(IDENTITY_TEMP_DIRECTORY)
