#!/usr/bin/env node


import express from 'express';
import cors from 'cors';
import { urlLoggerMiddleware } from './utils/server.js';
import fs from 'fs'
import path from 'path'
import spawn from 'cross-spawn';
import { exec, execSync } from 'child_process';
import { v4 } from 'uuid';


const app = express();

app.use(express.json({ limit: '10mb' }))
app.use(cors({
    origin: '*'
}))
app.use(urlLoggerMiddleware)




const PORT = process.env.PORT || 8002;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})


const IDENTITY_DIRECTORY = "__identity__"


app.post('/save-function-execution-trace', async (req, res) => {

    const body = req.body;

    const { traceID, environmentName } = body;
    if (body.type === 'function_trace') {
        let functions = body.data;
        functions = functions.map(f => ({ ...f, traceID, environmentName, _id: f.functionID }))

        const functionMap = {}
        functions.filter(f => !f.parentID).forEach(f => {
            functionMap[f.functionID] = {
                ...f,
                children: []
            }
        })
        functions.filter(f => !!f.parentID).forEach(f => {
            functionMap[f.parentID].children.push(f)
        })

        const functionsToSave = Object.values(functionMap)

        const promises = functionsToSave.map(f => {
            return new Promise((resolve, reject) => {
                fs.writeFile(`${IDENTITY_DIRECTORY}/executions/${f.functionID}.json`, JSON.stringify(f), (err) => {
                    if (err) {
                        return reject(err)
                    }
                    console.log(`File saved ${f.functionID}`)
                    resolve(f);
                })
            })
        })

        try {
            const result = await Promise.all(promises)
            res.json(result)
        } catch (e) {
            res.status(500).json({ error: e?.toString() })
        }
    }
})

app.get('/get-executed-functions', async (req, res) => {


    const executionPath = `${IDENTITY_DIRECTORY}/executions/`

    const promise = new Promise((resolve, reject) => {
        fs.readdir(executionPath, (err, files) => {
            if (err) {
                reject(err)
            }
            const filesNames = files.map(f => {

                return path.join(executionPath, f);

            })

            const promises = filesNames.map(fname => {
                return new Promise((res, rej) => {
                    fs.readFile(fname, (err, data) => {
                        if (err) {
                            return rej(err)
                        }
                        res(JSON.parse(data.toString()))
                    })
                })
            })

            Promise.all(promises).then(fDataS => resolve(fDataS)).catch(err => reject(err))
        })
    })


    try {
        const result = await promise;
        res.json(result)
    } catch (e) {
        res.status(500).json({ error: e?.toString() })
    }
})

app.get('/get-executed-function/:id', async (req, res) => {


    const functionID = req.params.id

    const executionPath = `${IDENTITY_DIRECTORY}/executions/`

    const promise = new Promise((resolve, reject) => {

        const filePath = `${executionPath}${functionID}.json`
        if (!fs.existsSync(filePath)) {
            reject("Invalid function id.")
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(err)
            }
            resolve(JSON.parse(data.toString()))
        })
    })


    try {
        const result = await promise;
        res.json(result)
    } catch (e) {
        res.status(500).json({ error: e?.toString() })
    }


})

app.post('/save-test-case', async (req, res) => {

    const testCasePath = `${IDENTITY_DIRECTORY}/testCases/`


    const testCaseConfig = req.body;

    let id = testCaseConfig._id;

    if (!testCaseConfig._id) {
        id = new Date().getTime().toString()
        testCaseConfig._id = id
    }


    try {
        fs.writeFileSync(`${testCasePath}${id}.json`, JSON.stringify(testCaseConfig))
        res.json(testCaseConfig)
    } catch (e) {
        res.status(500).json({ error: e?.toString() })
    }


})
app.get('/get-test-case/:id', async (req, res) => {


    const testCaseID = req.params.id

    const testCasePath = `${IDENTITY_DIRECTORY}/testCases/`

    try {
        const filePath = `${testCasePath}${testCaseID}.json`
        if (!fs.existsSync(filePath)) {
            return res.status(404)
        }
        const result = fs.readFileSync(filePath)
        res.json(JSON.parse(result.toString()))
    } catch (e) {
        res.status(500).json({ error: e?.toString() })
    }

})

app.get('/test-cases', async (req, res) => {

    const testCasePath = `${IDENTITY_DIRECTORY}/testCases/`

    try {
        const files = fs.readdirSync(testCasePath)
        const fileNames = files.map(f => path.join(testCasePath, f))
        const promises = fileNames.map(fname => {
            return new Promise((resolve, reject) => {
                const res = fs.readFileSync(fname)
                resolve(JSON.parse(res.toString()))
            })
        })
        const result = await Promise.all(promises)
        res.json(result)
    } catch (e) {
        res.status(500).json({ error: e?.toString() })
    }


})

app.get('/get-test-runs', async (req, res) => {


    const testRunDirectory = `${IDENTITY_DIRECTORY}/testRuns/`

    try {
        const files = fs.readdirSync(testRunDirectory)
        const fileNames = files.map(f => path.join(testRunDirectory, f))
        const promises = fileNames.map(fname => {
            return new Promise((resolve, reject) => {
                const res = fs.readFileSync(fname)
                resolve(JSON.parse(res.toString()))
            })
        })
        const result = await Promise.all(promises)
        res.json(result)
    } catch (e) {
        res.status(500).json({ error: e?.toString() })
    }

})

app.get('/get-test-run/:id', async (req, res) => {
    const testRunID = req.params.id

    const testRunPath = `${IDENTITY_DIRECTORY}/testRuns/`

    try {
        const filePath = `${testRunPath}${testRunID}.json`
        if (!fs.existsSync(filePath)) {
            return res.status(404)
        }
        const result = fs.readFileSync(filePath)
        res.json(JSON.parse(result.toString()))
    } catch (e) {
        res.status(500).json({ error: e?.toString() })
    }

})

app.post('/save-test-run', async (req, res) => {


    const body = req.body;

    const testRunPath = `${IDENTITY_DIRECTORY}/testRuns/`

    const { traceID, environmentName, testSuiteId, testCaseId, testRunId } = body;
    if (body.type === 'function_trace') {
        let functions = body.data;
        functions = functions.map(f => ({ ...f, traceID, environmentName, _id: f.functionID }))

        const functionMap = {}
        functions.filter(f => !f.parentID).forEach(f => {
            functionMap[f.functionID] = {
                ...f,
                children: []
            }
        })
        functions.filter(f => !!f.parentID).forEach(f => {
            functionMap[f.parentID].children.push(f)
        })

        const functionsToSave = Object.values(functionMap)




        const testCasePath = `${IDENTITY_DIRECTORY}/testCases/`

        const result = fs.readFileSync(`${testCasePath}${testSuiteId}.json`)
        const testSuite = JSON.parse(result.toString());

        let testRun = null
        if (!fs.existsSync(`${testRunPath}${testRunId}.json`)) {
            testRun = { ...testSuite, _id: testRunId }
        } else {
            const r = fs.readFileSync(`${testRunPath}${testRunId}.json`)
            testRun = JSON.parse(r.toString())
        }


        const testCase = testRun.tests?.find(tc => tc.id === testCaseId)
        if (!testCase) {
            return res.status(500).json({ error: "Invalid test case id." });
        }
        testCase.executedFunction = functionsToSave[0]

        fs.writeFileSync(`${testRunPath}${testRunId}.json`, JSON.stringify(testRun));

        res.json(testRun)

    }

})


app.get("/get-settings", async (req, res) => {
    const settingsData = fs.readFileSync(`${IDENTITY_DIRECTORY}/config.json`)
    const settings = JSON.parse(settingsData.toString())
    res.json(settings)
})

app.post("/save-settings", async (req, res) => {

    const body = req.body

    const settingsData = fs.readFileSync(`${IDENTITY_DIRECTORY}/config.json`)
    let settings = JSON.parse(settingsData.toString())

    settings = {
        ...settings,
        ...body
    }

    fs.writeFileSync(`${IDENTITY_DIRECTORY}/config.json`, JSON.stringify(settings))

    res.json(settings)

})



app.post("/run-test", async (req, res) => {

    const testCaseId = req.body.testCaseId;

    let args = [];
    if (testCaseId) {
        args = [`--testCaseId="${testCaseId}"`]
    }

    const testRunPath = `${IDENTITY_DIRECTORY}/testRuns/`
    const testRunId = v4()

    const settingsData = fs.readFileSync(`${IDENTITY_DIRECTORY}/config.json`)
    let settings = JSON.parse(settingsData.toString())

    const cwd = process.cwd();
    console.log(`executing cd "${cwd}"; ${settings.command} --testSuiteId="${testCaseId}" --testRunId="${testRunId}"`)

    const result = exec(`cd "${cwd}"; ${settings.command} --testSuiteId="${testCaseId}" --testRunId="${testRunId}"`, (err, stdout, stderr) => {
        console.log(stdout.toString())
        if (err) {
            console.error(err)
            return res.status(500).json({ error: err.message })
        }

        const r = fs.readFileSync(`${testRunPath}${testRunId}.json`)
        const testRun = JSON.parse(r.toString())
        return res.json(testRun)

    })





    // result.on('message', (message) => {
    //     console.log(message)
    // })

    // result.on("close", (code) => {
    //     if (code === -2) {
    //         return
    //     }
    //     if (testCaseId) {
    //         getTestRuns().then(testRuns => {
    //             const testRun = testRuns.find(t => t?.testCase?._id === testCaseId)
    //             return res.json(testRun)
    //         })
    //     } else {
    //         res.json({})
    //     }
    // })
    // result.on("error", (err) => {

    // })



})






const getTestRuns = async () => {
    const testRunDirectory = `${IDENTITY_DIRECTORY}/testRuns/`


    const files = fs.readdirSync(testRunDirectory)
    const fileNames = files.map(f => path.join(testRunDirectory, f))
    const promises = fileNames.map(fname => {
        return new Promise((resolve, reject) => {
            const res = fs.readFileSync(fname)
            resolve(JSON.parse(res.toString()))
        })
    })
    const result = await Promise.all(promises)
    return result

}