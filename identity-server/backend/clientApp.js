

import { v4 } from "uuid";
import fs from "fs"
import { exec } from "child_process";

import * as userSettingsLoader from "./entities/UserSetting/loader.js"
import { IDENTITY_TEMP_DIRECTORY } from "./constants.js";
import { readJSONFilePromised } from "./utils/readJSONFilePromised.js";
import { writeFileJSONPromised } from "./utils/writeFileJSONPromised.js";
import { getServerRestApiUrl } from "./utils/getServerURL.js";

let clientApp = {};

const clientReportMap = {};

export const registerEndpoints = (app) => {

    app.post("/client_app_completion_endpoint/:id", (req, res) => {
        const id = req.params.id
        if (!clientReportMap[id]) {
            return
        }
        res.status(200)
        res.send()

        try {
            // This to not block the thread and immediately send empty response
            (async () => {
                clientReportMap[id](req.body)
            })().then(res => {
                console.log("Handled client report endpoint successfully.")
            })
        } catch (e) {
            console.error(`Could not handle client report endpoint.`)
        }

    })
}

export const getClientAppSocket = () => {
    return clientApp.socket || null
}

export const registerReportHandlerForReportEndpoint = (reportID, handler) => {
    clientReportMap[reportID] = handler
}
export const deleteReportHandlerForReportEndpoint = (reportID) => {
    delete clientReportMap[reportID]
}

/**
 * Creates a run file and invokes the script to run the functions on client app.
 * Returns a promise which gets resolved when the process finishes successfully. 
 * Promise gets rejected when process is existed with 1.
*/
export const runFunctionsOnClientApp = async (functionArray) => {

    const runFileID = v4()

    // Create a run file

    const runFileName = `${IDENTITY_TEMP_DIRECTORY}/${runFileID}.json`

    await writeFileJSONPromised(runFileName, {
        functions_to_run: functionArray
    })

    const settings = await userSettingsLoader.getSettings()

    const cwd = process.cwd();

    // Run command to run functions on client app

    console.log(`executing cd "${cwd}"; ${settings.command} --runFile="${runFileID}"`)

    const promise = new Promise((resolve, reject) => {

        exec(`cd "${cwd}"; ${settings.command} --runFile="${runFileID}"`, (err, stdout, stderr) => {

            console.log(stdout.toString())

            if (err) {
                console.error(err)
                reject(new Error(`${stderr.toString()}, ${err?.toString()}`))
            }

            readJSONFilePromised(runFileName).then((functionRuns) => {
                // resolve executed functions
                const executedFunction = functionRuns.functions_to_run?.map(c => c.executed_function)
                if (!executedFunction?.every(e => !!e)) {
                    reject(stdout.toString())
                }
                resolve(executedFunction)

            }).catch(err => {
                reject(`Could not read run file after client process got finished.${err?.toString() || ""} `)
            }).finally(() => {
                // remove the run file
                fs.unlinkSync(runFileName)
            })


        })
    })

    return promise
}

/**
 * Runs test on client app by invoking the python command.
 * Returns a promise that gets resolved when the process finishes.
 * Rejects a promise if the process exits with 1.
 */
export const runTestsOnClientApp = async ({
    name, moduleName, functionName, testSuiteID
}, onTestSuiteComplete) => {

    const reportID = v4()
    const settings = await userSettingsLoader.getSettings()

    const cwd = process.cwd();

    let commandFilters = [];

    if (name) {
        commandFilters.push(`--name=${name}`)
    }
    if (moduleName) {
        commandFilters.push(`--moduleName=${moduleName}`)
    }
    if (functionName) {
        commandFilters.push(`--functionName=${functionName}`)
    }
    if (testSuiteID) {
        commandFilters.push(`--testSuiteID=${testSuiteID}`)
    }

    if (onTestSuiteComplete) {
        commandFilters.push(`--reportURL="${await getServerRestApiUrl()}/client_app_completion_endpoint/${reportID}"`)
        registerReportHandlerForReportEndpoint(
            reportID, (testSuiteResultReport) => {
                onTestSuiteComplete(testSuiteResultReport)
            }
        )
    }

    const command = `cd "${cwd}"; ${settings.command} --runTests ${commandFilters.join(" ")}`
    // Run command to run functions on client app

    console.log(`executing ${command}`)


    const promise = new Promise((resolve, reject) => {

        exec(command, (err, stdout, stderr) => {

            console.log(stdout.toString())

            if (err) {
                console.error(err)
                reject(new Error(`${stderr.toString()}, ${err?.toString()}`))
            }

            deleteReportHandlerForReportEndpoint(reportID)
            resolve()

        })
    })

    return promise
}