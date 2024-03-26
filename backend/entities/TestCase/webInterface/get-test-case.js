import { getTestCaseById } from "../loader.js"



export const get_test_case = async (req, res) => {
    try {
        const testCase = await getTestCaseById(req.params.id)
        return res.json(testCase);
    } catch (e) {
        res.status(500).json({ error: e?.toString() })
    }
}