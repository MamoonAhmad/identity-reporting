import { get_test_case } from "./get-test-case.js"
import { save_test_case } from "./save-test-case.js"
import { test_cases } from "./test-cases.js"




export default function registerTestCaseEndpoints(app) {

    app.post('/save-test-case', save_test_case)
    app.get('/test-case/:id', get_test_case)
    app.get('/test-cases', test_cases)
}