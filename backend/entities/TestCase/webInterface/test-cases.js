import { getAllTestCases } from "../loader.js"




export const test_cases = async (req, res) => {
    const result = await getAllTestCases()
    res.json(result)
}