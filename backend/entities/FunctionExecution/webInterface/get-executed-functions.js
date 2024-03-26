import { FunctionExecutionModel } from "../model.js"




export const get_executed_functions = async (req, res) => {

    try {
        const functions = await FunctionExecutionModel.find()
        return res.json(functions)
    } catch (e) {
        res.status(500).json({
            error: e?.toString()
        })
    }

}