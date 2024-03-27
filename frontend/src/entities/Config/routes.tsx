import { ViewSettings } from "./ViewSettings";

export const ConfigRoutes = {
  ViewConfig: "/config",
};

export const ConfigRoutesConfig = [
  {
    path: ConfigRoutes.ViewConfig,
    element: <ViewSettings />,
  },
];
