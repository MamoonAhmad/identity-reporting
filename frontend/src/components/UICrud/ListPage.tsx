import {
  AddSharp,
  DeleteSharp,
  EditSharp,
  RemoveRedEyeSharp,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useReducer } from "react";
import { Link } from "react-router-dom";

type EndpointFunction = (o: any) => string;
type ObjectAction = {
  view?: EndpointFunction;
  edit?: EndpointFunction;
  delete?: EndpointFunction;
};
type ActionColumnComponent = React.FC<{ object: any }>;

export const ListPage: React.FC<{
  loader: () => Promise<any>;
  keyColumnMap: {
    [key: string]: string;
  };
  columnOverride?: { [key: string]: React.FC<{ object: any }> };
  actionColumn?: ActionColumnComponent;
  actions?: ObjectAction;
  pageTitle: string | React.ReactElement;
}> = ({
  loader,
  keyColumnMap,
  actionColumn,
  actions,
  columnOverride = {},
  pageTitle,
}) => {
  const columns = useMemo(
    () => Object.keys(keyColumnMap).map((k) => keyColumnMap[k]),
    [keyColumnMap]
  );

  const objectKeys = Object.keys(keyColumnMap);

  const [state, setState] = useReducer((p: any, c: any) => ({ ...p, ...c }), {
    loading: false,
  });

  useEffect(() => {
    setState({ loading: true });
    loader().then((data) => {
      setState({ data, loading: false });
    });
  }, []);

  return (
    <Container sx={{ bgcolor: "background.default", py: 3 }}>
      <Grid container spacing={2}>
        <Grid
          xs={12}
          flexDirection={"row"}
          justifyContent={"space-between"}
          display={"flex"}
          mt={2}
          mb={3}
        >
          {typeof pageTitle === "string" ? (
            <Typography variant="h4">{pageTitle}</Typography>
          ) : (
            pageTitle
          )}
        </Grid>
        <Grid container sx={{ px: 2 }}>
          <Grid item xs={12}>
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    {columns.map((col) => {
                      return <TableCell>{col}</TableCell>;
                    })}
                    {(actions || actionColumn) && <TableCell>Action</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.loading && <CircularProgress size={40} />}
                  {!state.loading &&
                    state.data &&
                    state.data.map((d: any) => {
                      return (
                        <TableRow>
                          {objectKeys.map((k) => (
                            <TableCell>
                              {columnOverride[k]
                                ? columnOverride[k]({ object: d })
                                : d[k]}
                            </TableCell>
                          ))}
                          {(actions || actionColumn) && (
                            <TableCell>
                              <TableActions
                                object={d}
                                actionColumn={actionColumn}
                                actions={actions}
                              />
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

const TableActions: React.FC<{
  object: any;
  actionColumn?: ActionColumnComponent;
  actions?: ObjectAction;
}> = ({ actionColumn, actions, object }) => {
  const objectID = "";
  if (actionColumn) {
    return actionColumn({ object });
  } else if (actions) {
    return (
      <>
        {actions.view && (
          <TableViewAction object={object} url={actions.view(object)} />
        )}
        {actions.edit && (
          <TableEditAction object={object} url={actions.edit(object)} />
        )}
        {actions.delete && (
          <TableDeleteAction object={object} url={actions.delete(object)} />
        )}
      </>
    );
  }
  return null;
};

const TableViewAction: React.FC<{ object: any; url: string }> = ({ url }) => {
  return (
    <IconButton onClick={() => navigate(url)}>
      <RemoveRedEyeSharp />
    </IconButton>
  );
};

const TableEditAction: React.FC<{ object: any; url: string }> = ({ url }) => {
  return (
    <IconButton onClick={() => navigate(url)}>
      <EditSharp />
    </IconButton>
  );
};

const TableDeleteAction: React.FC<{ object: any; url: string }> = ({ url }) => {
  return (
    <IconButton onClick={() => navigate(url)}>
      <DeleteSharp />
    </IconButton>
  );
};

const navigate = (url: string) => {
  window.location.href = url;
};
