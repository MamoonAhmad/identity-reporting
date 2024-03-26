import { getParentFunctionWithChildren } from "../loader.js"





export const get_executed_function = async (req, res) => {
    try {
        const functionID = req.params.id
        const result = await getParentFunctionWithChildren(functionID)
        res.json(result)
    } catch (e) {
        res.status(500).json({
            error: e?.toString()
        })
    }
}