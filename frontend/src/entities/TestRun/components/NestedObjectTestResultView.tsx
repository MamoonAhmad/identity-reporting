import { useState } from "react";
import {
  NestedObjectColumnItem,
  NestedObjectColumns,
} from "../../../components/NestedObjectView/NestedObjectView";
import {
  FunctionTestResult,
  GenericObjectTestResult,
} from "../../../components/NestedObjectView/matcher";
import {
  Box,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  CloseSharp,
  DoneSharp,
  KeyboardArrowRightSharp,
  ReplaySharp,
} from "@mui/icons-material";

type GenericTestResult = FunctionTestResult | GenericObjectTestResult;
const getChildren = (
  object: GenericTestResult,
  objectPath: string[]
): NestedObjectColumnItem[] => {
  if (object._type === "FunctionTestResult") {
    return getFunctionTestResultChildren(object, objectPath);
  } else if (object._type === "ObjectTestResult") {
    return getGenericObjectTestResultChildren(object, objectPath);
  }
  return [];
};

const hasChildren = (object: FunctionTestResult | GenericObjectTestResult) => {
  return (
    object._type === "FunctionTestResult" ||
    (object._type === "ObjectTestResult" && object.type !== "literal")
  );
};
const getFunctionTestResultChildren = (
  obj: FunctionTestResult,
  objectPath: string[]
): NestedObjectColumnItem[] => {
  return [
    {
      id: "input",
      name: "Input",
      object: obj.input,
      objectPath: [...objectPath, "input"],
      selected: false,
    },
    {
      id: "output",
      name: "Output",
      object: obj.output,
      objectPath: [...objectPath, "output"],
      selected: false,
    },

    ...(obj.children.map((cr) => ({
      id: cr.name,
      name: cr.name,
      object: cr,
      objectPath: [...objectPath, cr.name],
      selected: false,
    })) || []),
  ];
};

const getGenericObjectTestResultChildren = (
  obj: GenericObjectTestResult,
  objectPath: string[]
): NestedObjectColumnItem[] => {
  if (obj.type === "object") {
    return Object.keys(obj.expectedValue).map((k) => {
      return {
        id: k,
        name: k,
        object: obj.expectedValue[k],
        objectPath: [...objectPath, k],
        selected: false,
      };
    });
  } else if (obj.type === "array") {
    return obj.expectedValue.map((c, i) => {
      return {
        id: i.toString(),
        name: i.toString(),
        object: c,
        objectPath: [...objectPath, i.toString()],
        selected: false,
      };
    });
  }
  return [];
};

const getColumns = (
  obj: FunctionTestResult,
  objectPath: string[]
): NestedObjectColumnItem[][] => {
  const columns: NestedObjectColumnItem[][] = [
    [
      {
        id: obj.name,
        name: obj.name,
        object: obj,
        objectPath: [obj.name],
        selected: true,
      },
    ],
  ];

  let previousSelected = columns[0][0];
  for (let a = 1; a <= objectPath.length; a++) {
    previousSelected.selected = true;
    const nextColumns = getChildren(
      previousSelected.object,
      previousSelected.objectPath
    );
    if (!nextColumns.length) {
      break;
    }
    columns.push(nextColumns);
    const currentName = objectPath[a];
    if (currentName) {
      previousSelected = nextColumns.find((c) => c.id === currentName)!;
    }
  }

  return columns;
};

export const TestResultColumns: React.FC<{ object: FunctionTestResult }> = ({
  object,
}) => {
  const [columns, setColumns] = useState<NestedObjectColumnItem[][]>(
    getColumns(object, [object.name])
  );
  return (
    <NestedObjectColumns
      objects={columns}
      onObjectSelected={(o) => {
        setColumns(getColumns(object, o.objectPath));
      }}
      DetailView={TestResultDetailView}
      ListItemView={({ object, selectObject }) => {
        return (
          <Button
            sx={{
              width: "100%",
              height: 20,
              backgroundColor: object.selected ? "cyan" : "white",
              color: object.selected ? "white" : "cyan",
              "&:hover": {
                backgroundColor: "cyan",
                color: "white",
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              cursor: "pointer",
              textTransform: "none",
            }}
            onClick={() => selectObject()}
          >
            <Box sx={{ mx: 2 }}>
              {object?.object?.executionContext?.isMocked ? (
                <ReplaySharp />
              ) : object.object?.successful ? (
                <DoneSharp color="success" />
              ) : (
                <CloseSharp color="error" />
              )}
            </Box>
            <Typography variant="body1" sx={{ flexGrow: 1, textAlign: "left" }}>
              {object.name}
            </Typography>
            {hasChildren(object.object || {}) && <KeyboardArrowRightSharp />}
          </Button>
        );
      }}
    />
  );
};

export const TestResultDetailView: React.FC<{
  object: NestedObjectColumnItem;
}> = ({ object }) => {
  const resultObject: GenericTestResult = object.object;

  return (
    <>
      <Grid container>
        <Grid item xs={12} display={"flex"} alignItems={"center"}>
          <Typography variant="h5">{object.name}</Typography>

          <Box sx={{ ml: 1 }}>
            {resultObject.successful ? (
              <Chip label="Passed" color="success" size="small" />
            ) : (
              <Chip label="Failed" color="error" size="small" />
            )}
          </Box>
        </Grid>

        <Grid xs={12} sx={{ mt: 2 }}>
          {resultObject.successful ? (
            <TestResultSuccessView object={resultObject} />
          ) : (
            <TestResultFailView object={resultObject} />
          )}
        </Grid>
      </Grid>
    </>
  );
};

const TestResultSuccessView: React.FC<{ object: GenericTestResult }> = ({
  object,
}) => {
  if (object._type === "ObjectTestResult" && object.type === "literal") {
    return (
      <>
        <Grid xs={12} display={"flex"} alignItems={"center"}>
          <Typography variant="subtitle1">Result:</Typography>
          <Typography sx={{ ml: 1 }} variant="body1" color={"green"}>
            Value received is as expected.
          </Typography>
        </Grid>
        <Grid xs={12} display={"flex"} alignItems={"center"}>
          <Typography variant="subtitle1">Operator:</Typography>
          <Typography sx={{ ml: 1 }} variant="body1" color="orange">
            {object.operator?.toUpperCase()}
          </Typography>
        </Grid>
        <Grid
          xs={12}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"flex-start"}
        >
          <Typography variant="subtitle1">Expected Value:</Typography>
          <Typography sx={{ ml: 1 }} variant="body1" color="green">
            {String(object.expectedValue)}
          </Typography>
        </Grid>
      </>
    );
  } else if (object._type === "ObjectTestResult") {
    return (
      <>
        <Grid xs={12} display={"flex"} alignItems={"center"}>
          <Typography sx={{ ml: 1 }} variant="body1">
            Received value matched the config.
          </Typography>
        </Grid>
      </>
    );
  } else if (object._type === "FunctionTestResult") {
    return (
      <>
        <Grid
          xs={12}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"flex-start"}
        >
          <Typography variant="subtitle1">Result:</Typography>
          <Typography sx={{ ml: 1 }} variant="body1" color={"green"}>
            Successfully matched with config.
          </Typography>
        </Grid>
        <Grid
          xs={12}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"flex-start"}
        >
          {object.executedSuccessfully ? (
            <Typography variant="body1" color={"green"}>
              Function successfully executed.
            </Typography>
          ) : (
            <>
              <Typography align="left">
                <Typography variant="body1">Thrown Error: </Typography>
                <Typography variant="body1" color={"red"}>
                  {object.thrownError}
                </Typography>
              </Typography>
            </>
          )}
        </Grid>
        {object.children.length ? (
          <Grid xs={12} display={"flex"} alignItems={"center"}>
            <Typography sx={{ ml: 1 }} variant="body1" color={"green"}>
              All child functions matched with config.
            </Typography>
          </Grid>
        ) : null}
      </>
    );
  }
  return null;
};

const TestResultFailView: React.FC<{ object: GenericTestResult }> = ({
  object,
}) => {
  if (object._type === "ObjectTestResult" && object.type === "literal") {
    return (
      <>
        <Grid xs={12} display={"flex"} alignItems={"center"}>
          <Typography variant="subtitle1">Result:</Typography>
          <Typography sx={{ ml: 1 }} variant="body1" color={"red"}>
            Value did not match the config.
          </Typography>
        </Grid>
        <Grid xs={12} display={"flex"} alignItems={"center"}>
          <Typography variant="subtitle1">Operator:</Typography>
          <Typography sx={{ ml: 1 }} variant="body1" color="orange">
            {object.operator?.toUpperCase()}
          </Typography>
        </Grid>
        <Grid
          xs={12}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"flex-start"}
        >
          <Typography variant="subtitle1">Expected Value:</Typography>
          <Typography sx={{ ml: 1 }} variant="body1" color="green">
            {String(object.expectedValue)}
          </Typography>
        </Grid>
        <Grid
          xs={12}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"flex-start"}
        >
          <Typography variant="subtitle1">Received Value:</Typography>
          <Typography sx={{ ml: 1 }} variant="body1" color="red">
            {String(object.receivedValue)}
          </Typography>
        </Grid>
      </>
    );
  } else if (object._type === "ObjectTestResult") {
    return (
      <>
        <Grid xs={12} display={"flex"} alignItems={"center"}>
          <Typography sx={{ ml: 1 }} variant="body1">
            Received value matched the config.
          </Typography>
        </Grid>
      </>
    );
  } else if (object._type === "FunctionTestResult") {
    return (
      <>
        <Grid
          xs={12}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"flex-start"}
        >
          <Typography variant="subtitle1">Result:</Typography>
          <Typography sx={{ ml: 1 }} variant="body1" color={"red"}>
            Did not match with config.
          </Typography>
        </Grid>
        <List>
          {object.failureReasons?.map((r) => (
            <ListItem>
              <ListItemIcon>
                <CloseSharp color="error" fontSize="medium" />
              </ListItemIcon>
              <ListItemText>{r}</ListItemText>
            </ListItem>
          ))}
        </List>
      </>
    );
  }
  return null;
};
