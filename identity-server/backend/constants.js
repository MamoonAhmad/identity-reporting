import { initDirectory } from "./utils/initDirectory.js";

export const IDENTITY_DIRECTORY = "__identity__"
export const IDENTITY_TEMP_DIRECTORY = `${IDENTITY_DIRECTORY}/__temp__`;

await initDirectory(IDENTITY_DIRECTORY)
await initDirectory(IDENTITY_TEMP_DIRECTORY)
