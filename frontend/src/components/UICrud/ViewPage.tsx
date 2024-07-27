import { CircularProgress, Container, Grid, Typography } from "@mui/material";
import { useEffect, useReducer } from "react";

export const ViewPage: React.FC<{
  HeaderActions?: React.FC<{ object: any }>;
  objectID: string;
  dataLoader: (id: string) => Promise<any>;
  title: string;
  Content?: React.FC<{ object: any }>;
  breadCrumb?: {
    url: string;
    label: string;
  }[];
}> = ({ title, dataLoader, HeaderActions, Content, objectID }) => {
  const [state, setState] = useReducer((p: any, c: any) => ({ ...p, ...c }), {
    loading: false,
  });

  useEffect(() => {
    setState({ loading: true, data: undefined });
    dataLoader(objectID).then((data) => {
      setState({ data, loading: false });
    });
  }, [objectID]);

  return (
    <Container>
      <Grid display={"flex"} mb={2}>
        <Grid flexGrow={1} display={"flex"} justifyContent={"flex-start"}>
          <Typography variant="h3">{title}</Typography>
        </Grid>
        {!state.loading && state.data && HeaderActions && (
          <Grid
            display={"flex"}
            alignItems={"center"}
            justifyContent={"flex-end"}
          >
            <HeaderActions object={state.data} />
          </Grid>
        )}
      </Grid>
      {state.loading && (
        <Grid display={"flex"} justifyContent={"center"} mt={10}>
          <CircularProgress size={40} />
        </Grid>
      )}
      {!state.loading && state.data && (
        <Grid container>{Content && <Content object={state.data} />}</Grid>
      )}
    </Container>
  );
};
