import React, { PropsWithChildren, useCallback, useRef } from "react"
import { useGeneralState } from "../helpers/useGeneralState"



export type StoreStateType = {
    SidePanelComponents: React.FC[]
}



export const StoreContext = React.createContext<
    {
        state: StoreStateType;
        dispatch: (actionName: string, data: Partial<StoreStateType>) => void;
        getNextZIndex: () => number;
        goToPreviousZIndex: () => void;
        setState: (s: Partial<StoreStateType>) => void
    }
>({} as any)

export const StoreContextProvider: React.FC<PropsWithChildren> = ({ children }) => {

    const [state, setState] = useGeneralState<StoreStateType>({SidePanelComponents: []})

    const currentZIndex = useRef(0)

    const getNextZIndex = useCallback(() => {
        currentZIndex.current += 1000
        return currentZIndex.current
    }, [])

    const goToPreviousZIndex = useCallback(() => {
        if (currentZIndex.current > 0) {
            currentZIndex.current -= 1000
        }
        if (currentZIndex.current < 0) {
            currentZIndex.current = 0
        }
        return currentZIndex.current
    }, [])


    const dispatch = useCallback((action: string, data: any) => {
        setState({ [action]: data })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <StoreContext.Provider value={{ state, dispatch, getNextZIndex, goToPreviousZIndex, setState }}>
        {children}
    </StoreContext.Provider>
}