import { Box, List, TextField, useTheme } from "@mui/material";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";

/** Explorer
 * getChildren: (o) => {id: string, name: string}
 * object: any
 * DetailView: React.FC<{object: any}>
 * selectedObjectPath: string[]
 * onSelectedObjectPathChange: (selectedObjectPath: string[]) => void
 */

export type NestedObjectColumnItem = {
  id: string;
  name: string;
  selected: boolean;
  object: any;
  objectPath: string[];
};

export const NestedObjectColumns: React.FC<{
  objects: NestedObjectColumnItem[][];
  onObjectSelected: (nestedObject: NestedObjectColumnItem) => void;
  DetailView: React.FC<{ object: any }>;
  ListItemView: React.FC<{ object: any; selectObject: () => void }>;
}> = ({ objects, onObjectSelected, DetailView, ListItemView }) => {
  const selectedObject = useMemo(() => {
    for (let a = objects.length - 1; a >= 0; a--) {
      const selected = objects[a].find((i) => i.selected);
      if (selected) {
        return selected;
      }
    }
    return undefined;
  }, [objects]);

  const boxRef = useRef<any>(null);

  useEffect(() => {
    // Scroll to the end of the box when component mounts
    if (boxRef.current) {
      boxRef.current.scrollLeft =
        boxRef.current.scrollWidth - boxRef.current.clientWidth;
    }
  }, [objects]);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "stretch",
        justifyContent: "space-between",
        height: 400,
        width: "100%",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflowX: "scroll",
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "stretch",
        }}
        ref={boxRef}
      >
        {objects.map((o) => (
          <NestedObjectColumn
            {...{ ListItemView, objects: o, onObjectSelected }}
          />
        ))}
      </Box>
      {selectedObject && (
        <Box
          sx={{
            width: 500,
            height: 400,
            padding: 2,
            bgcolor: "ButtonShadow",
            overflow: "scroll",
          }}
        >
          <DetailView object={selectedObject} />
        </Box>
      )}
    </Box>
  );
};

const NestedObjectColumn: React.FC<{
  objects: NestedObjectColumnItem[];
  onObjectSelected: (nestedObject: NestedObjectColumnItem) => void;
  ListItemView: React.FC<{
    object: NestedObjectColumnItem;
    selectObject: () => void;
  }>;
}> = ({ objects, onObjectSelected, ListItemView }) => {
  const theme = useTheme();

  const [state, setState] = useReducer((p: any, c: any) => ({ ...p, ...c }), {
    searchText: "",
  });

  const getObjects = () => {
    if (state.searchText) {
      return objects.filter((o) => o.name.includes(state.searchText));
    }
    return objects;
  };

  useEffect(() => {
    setState({ searchText: "" });
  }, [objects]);

  return (
    <Box
      minWidth={200}
      maxWidth={400}
      maxHeight={400}
      overflow={"scroll"}
      display={"flex"}
      flexDirection={"column"}
      flexShrink={0}
      sx={{
        borderRight: "1px solid",
        borderColor: theme.palette.grey[400],
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 1,
        }}
      >
        <TextField
          inputProps={{
            style: {
              padding: 4,
              paddingLeft: 10,
              paddingRight: 10,
            },
          }}
          fullWidth
          placeholder="Search"
          onChange={(e) => setState({ searchText: e.target.value })}
          value={state.searchText}
        ></TextField>
      </Box>
      <List>
        {getObjects()?.map((o) => {
          return (
            <ListItemView selectObject={() => onObjectSelected(o)} object={o} />
          );
        })}
      </List>
    </Box>
  );
};
