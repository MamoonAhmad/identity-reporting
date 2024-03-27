import express from 'express';
import cors from 'cors';
import { urlLoggerMiddleware } from './utils/server.js';
import registerEndpoints from './enpoints.js';
import fs from 'fs'


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
                fs.writeFile(`${IDENTITY_DIRECTORY}/executions/${f.functionID}`, JSON.stringify(f), (err) => {
                    if (err) {
                        reject(err)
                    }
                    console.log(`File saved ${f.functionID}`)
                    resolve(f);
                })
            })
        })

        try {
            const res = await Promise.all(promises)
            res.json(res)
        } catch (e) {
            res.status(500).json({ error: e?.toString() })
        }
    }
})

app.get('/get-executed-functions', async (req, res) => {


    const path = `${IDENTITY_DIRECTORY}/executions/`

    const promise = new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if(err) {
                reject(err)
            }
            files.map(f => {
                
            })
        })
    })
})

// app.get('/get-executed-function/:id', get_executed_function)

// app.post('/save-test-case', save_test_case)
// app.get('/get-test-case/:id', get_test_case)
// app.get('/test-cases', test_cases)

// app.get('/get-test-runs', get_test_runs)

// app.get('/get-test-run/:id', get_test_run)

// app.post('/save-test-run', save_test_run)