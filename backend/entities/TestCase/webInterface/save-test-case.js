import { saveTestCase } from "../loader.js";




export const save_test_case = async (req, res) => {
    const body = req.body;
    try {
        const result = await saveTestCase(body);
        res.json(result)
    } catch (e) {
        res.status(500).json({ error: e?.toString() })
    }

}