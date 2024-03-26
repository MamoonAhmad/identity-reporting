import { getAllTestRuns } from "../loader.js"


export const get_test_runs = async (req, res) => {

    const { testCaseId = null } = req.query || {}
    try {
        const result = await getAllTestRuns({ testCaseId })
        res.json(result)
    } catch (e) {
        res.status(500).json({
            error: e?.toString()
        })
    }
}
