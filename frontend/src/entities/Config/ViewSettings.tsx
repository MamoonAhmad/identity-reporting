import { Button, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useReducer } from "react";
import { ConfigServices } from "./services";
import { PageTitle } from "../../components/PageTitle";

export const ViewSettings: React.FC<any> = () => {
  const [state, setState] = useReducer(
    (p: any, c: any) => ({ ...p, ...c }),
    {}
  );

  useEffect(() => {
    ConfigServices.getConfig().then((res) => setState(res));
  }, []);

  return (
    <Grid container xs={12}>
      <PageTitle title="Settings" />
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
