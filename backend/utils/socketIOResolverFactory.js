




export const socketIOResolverFactory = ({endpoint, functionToRun, socketIOInstance, socket}) => {

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
                console.error(e, e.stack)
                console.log(`SocketIO - (${endpoint}) Failed - ${e?.toString()}`)
                socketIOInstance.emit(`${endpoint}:error`, e?.toString())
            }
        }
    ]
}
