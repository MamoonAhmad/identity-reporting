import { useContext, useEffect } from "react";

import { Close } from "@mui/icons-material";
import { StoreContext } from "../context/StoreContext";
import { useGeneralState } from "../helpers/useGeneralState";

const NullComponent: React.FC = () => null;

type SidePanelState = {
  ComponentToShow: React.FC;
  zIndex: number | undefined;
};
export const SidePanel = () => {
  const [state, setState] = useGeneralState<SidePanelState>({
    ComponentToShow: <NullComponent />,
    zIndex: undefined,
  });

  const {
    state: { SidePanelComponents },
    setState: setStoreState,
    getNextZIndex,
  } = useContext(StoreContext);

  useEffect(() => {
    if (SidePanelComponents?.length) {
      setState({
        ComponentToShow: SidePanelComponents[SidePanelComponents?.length - 1],
      });
    } else {
      setState({ ComponentToShow: NullComponent });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SidePanelComponents]);

  const showPanel = !!SidePanelComponents?.length;

  useEffect(() => {
    if (showPanel) {
      setState({ zIndex: getNextZIndex() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPanel]);

  return (
    <div
      className="flex flex-col transition-transform ease-in-out delay-75 overflow-scroll  bg-blue-100 shadow-lg fixed top-0 right-0"
      style={{
        transform: showPanel ? "" : "translateX(100%)",
        height: "100vh",
        width: "40vw",
        zIndex: 2000,
      }}
    >
      <div className="p-2 flex items-center justify-end sticky top-0">
        <button
          onClick={() => {
            setStoreState({ SidePanelComponents: [] });
          }}
        >
          <Close />
        </button>
      </div>
      <div className="p-3">{state.ComponentToShow}</div>
    </div>
  );
};
