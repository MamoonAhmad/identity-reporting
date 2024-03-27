import { Button, Grid, TextField, Typography } from "@mui/material";
import { ViewPage } from "../../components/UICrud/ViewPage";
import { useEffect, useReducer } from "react";
import { ConfigServices } from "./services";

export const ViewSettings = () => {
  return (
    <ViewPage
      title="Settings"
      dataLoader={async () => {
        return await ConfigServices.getConfig();
      }}
      Content={Settings}
    />
  );
};

const Settings: React.FC<any> = ({ object: settings }) => {
  const [state, setState] = useReducer(
    (p: any, c: any) => ({ ...p, ...c }),
    {}
  );

  useEffect(() => {
    settings && setState({ ...settings });
  }, [settings]);

  return (
    <Grid container xs={12}>
      <Grid
        item
        display={"flex"}
        flexDirection={"column"}
        alignItems={"stretch"}
        xs={12}
      >
        <Typography variant="body1" textAlign={"left"}>
          Command
        </Typography>
        <TextField
          value={state.command || ""}
          onChange={(e) => setState({ command: e.target.value })}
        />
      </Grid>
      <Button
        sx={{ mt: 2 }}
        onClick={() => {
          ConfigServices.saveConfig({ ...state });
        }}
      >
        Save Settings
      </Button>
    </Grid>
  );
};
