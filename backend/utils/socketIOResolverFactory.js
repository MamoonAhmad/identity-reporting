




export const socketIOResolverFactory = (endpoint, functionToRun) => {

    return [
        endpoint,
        async function () {
            console.log(`SocketIO - (${endpoint}) Called`)

            try {
                let res = functionToRun(...arguments)
                console.log(`SocketIO - (${endpoint}) Finished processing.`)
                if (res instanceof Promise) {
                    res = await res;
                }
                return res
            } catch (e) {
                console.log(`SocketIO - (${endpoint}) Failed - ${e?.toString()}`)
            }
        }
    ]
}
