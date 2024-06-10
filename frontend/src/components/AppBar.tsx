import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { CodeSharp, SettingsSharp } from "@mui/icons-material";
import { Button, Container } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { TestCaseRoutes } from "../entities/TestCase/routes";
import { TestRunRoutes } from "../entities/TestRun/routes";
import { FunctionExecutionRoutes } from "../entities/FunctionExecution/routes";
import { ConfigRoutes } from "../entities/Config/routes";
import { FunctionModal } from "../entities/FunctionExecution/components/RunFunctionModal";

const DrawerOptions: any = {
  executed_functions: {
    label: "Executed Functions",
    Icon: CodeSharp,
    route: FunctionExecutionRoutes.FunctionExecutionList,
  },
  test_cases: {
    label: "Test Cases",
    Icon: CodeSharp,
    route: TestCaseRoutes.TestCaseList,
  },
  test_runs: {
    label: "Test Runs",
    Icon: CodeSharp,
    route: TestRunRoutes.TestRunList,
  },
  config: {
    label: "Settings",
    Icon: SettingsSharp,
    route: ConfigRoutes.ViewConfig,
  },
};

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const [openRunCode, setOpenRunCode] = React.useState(false);

  const [state, setState] = React.useReducer(
    (p: any, c: any) => ({ ...p, ...c }),
    {
      currentDrawerOption: "test_cases",
    }
  );

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {openRunCode && <FunctionModal onClose={() => setOpenRunCode(false)} />}
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{ mr: 2, ...(open && { display: "none" }) }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                Code Identity Reporting Tool
              </Typography>
            </Box>
            <Button onClick={() => setOpenRunCode(true)} color="inherit">
              Run Function
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {Object.keys(DrawerOptions).map((key) => {
            const { Icon, label, route } = DrawerOptions[key];
            return (
              <ListItem
                key={key}
                disablePadding
                onClick={() => {
                  setState({ currentDrawerOption: key });
                  navigate(route);
                }}
              >
                <ListItemButton selected={state.currentDrawerOption === key}>
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Container>
          <Outlet />
        </Container>
      </Main>
    </Box>
  );
}
