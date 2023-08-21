import { useReducer } from "react"


export const useGeneralState = <T extends {[key: string]: any}>(initialState: Partial<T>, reducer?: (state: T, action: Partial<T>) => T): [T, (o: Partial<T>) => void] => {

    const [state, setState] = useReducer(reducer || ((state: T, action: Partial<T>) => ({...state, ...action})), initialState as T)

    return [state, setState]
}