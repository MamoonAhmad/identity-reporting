




export const getExecutedFunctionTreeFromExecutedFunctions = (executedFunctions) => {
    const rootFunctions = executedFunctions.filter(f => !f.parentID)

    const findChildrenForFunction = (func) => {
        const id = func._id
        const children = executedFunctions.filter(f => f.parentID === id)
        func.children = children.length ? children : null
        children.forEach(f => findChildrenForFunction(f))
    }
    rootFunctions.forEach(f => findChildrenForFunction(f))

    return rootFunctions;
}