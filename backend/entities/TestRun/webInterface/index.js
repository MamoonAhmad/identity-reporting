import { get_test_run } from "./get-test-run.js"
import { get_test_runs } from "./get-test-runs.js"
import { save_test_run } from "./save-test-run.js"


export default function registerTestRunEndpoints(app) {
    
    app.get('/get-test-runs', get_test_runs)

    app.get('/get-test-run/:id', get_test_run)

    app.post('/save-test-run', save_test_run)

}