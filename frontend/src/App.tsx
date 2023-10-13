
import "./App.css";

import { StoreContextProvider } from "./context/StoreContext";


import { RouterProvider } from "react-router-dom";
import { APP_ROUTES } from "./routes";



function App() {
  // const [count, setCount] = useState(0);

  return (
    <StoreContextProvider>
      <div
        style={{ height: "100vh", width: "100vw", overflow: "scroll" }}
        className="bg-white"
      >
        <RouterProvider router={APP_ROUTES} />
      </div>
    </StoreContextProvider>
  );
}

export default App;
