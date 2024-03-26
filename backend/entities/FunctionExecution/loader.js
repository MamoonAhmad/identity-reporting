import { FunctionExecutionModel } from "./model.js"




export const saveFunctionExecution = async (execution) => {

    try {

        const functionExecution = new FunctionExecutionModel(execution);

        await functionExecution.save()

        return functionExecution;

    } catch (e) {
        //trace
        throw e
    }
}

export const saveFunctionExecutions = async (executions) => {

    try {

        const functionExecutions = await FunctionExecutionModel.insertMany(executions);

        return functionExecutions;

    } catch (e) {
        //trace
        throw e
    }
}

export const getExecutedFunctionById = async (id) => {
    return await FunctionExecutionModel.findById(id)
}


export const getParentFunctionWithChildren = async (functionID) => {
    const functionRecord = await FunctionExecutionModel.findById(functionID)
    const traceID = functionRecord.traceID
    const allFunctionsAgainstTrace = await FunctionExecutionModel.find({ traceID: traceID })
    const map = {}
    const initMapEntry = (map, id) => {
        if (!map[id]) {
            map[id] = {
                function: null,
                children: []
            }
        }
    }
    allFunctionsAgainstTrace.forEach(f => {
        if (f.parentID) {
            initMapEntry(map, f.parentID)
            map[f.parentID].children.push(f)
        } else {
            initMapEntry(map, f.functionID)
            map[f.functionID].function = f
        }
    })
    const parentID = allFunctionsAgainstTrace.find(f => !f.parentID).functionID

    return {
        ...map[parentID].function.toJSON(),
        children: map[parentID].children.map(f => f.toJSON())
    }

}