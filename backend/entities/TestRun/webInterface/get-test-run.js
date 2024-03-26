import { getTestRunById } from "../loader.js"


export const get_test_run = async (req, res) => {
    const id = req.params.id
    try {
        const result = await getTestRunById(id)
        res.json(result)
    } catch (e) {
        res.status(500).json({
            error: e?.toString()
        })
    }
}