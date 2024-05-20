




export const expressEndpointResolver = (handlerFunction = () => undefined) => {


    return async function (req, res) {

        try {
            let result = handlerFunction(req, res)
            if (result instanceof Promise) {
                result = await result
            }

            if (!result) {
                return res.json({})
            }
            return res.json(result)
        } catch (e) {
            res.json({
                error: e?.toString()
            })
        }
    }

}