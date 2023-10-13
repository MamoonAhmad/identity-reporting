import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useMemo } from "react";
import { useGeneralState } from "../../helpers/useGeneralState";
import { CloseSharp } from "@mui/icons-material";

export type NestedObjectUIListItem = {
  name: string;
  object: any;
  onChange: (object: any) => void;
  id: string;
};

type APIProps = {
  getChildren: (
    name: string,
    o: any,
    onChange: (o: any) => void
  ) => NestedObjectUIListItem[] | null;
  ListItemView: React.FC<{
    onSelect: () => void;
    config: NestedObjectUIListItem;
    selected: boolean;
  }>;
  DetailView: React.FC<{
    config: NestedObjectUIListItem;
  }>;

  onObjectPathChange: (a: string[]) => void;
  objectPath: string[];
};

export const NestedObjectView: React.FC<
  {
    open: boolean;
    onClose: () => void;
    title: string;

    label: string;

    initialObjects: NestedObjectUIListItem[];
  } & APIProps
> = ({
  open,
  onClose,
  initialObjects,
  onObjectPathChange,
  objectPath,
  title,
  label,
  getChildren,
  ListItemView,
  DetailView,
}) => {
  const { columns, selectedObject } = useMemo(() => {
    const cols = [initialObjects];
    let selectedObject = null;

    objectPath?.forEach((objectID, i) => {
      const currentColumnSelectedObject = cols[i]?.find(
        (o) => o.id === objectID
      );
      if (!currentColumnSelectedObject) {
        return;
      }
      const children = getChildren(
        currentColumnSelectedObject.name,
        currentColumnSelectedObject.object,
        currentColumnSelectedObject.onChange
      );
      if (children && children.length) {
        cols.push(children);
      }
      if (!objectPath[i + 1]) {
        selectedObject = currentColumnSelectedObject;
      }
    });

    return { columns: cols, selectedObject };
  }, [initialObjects, objectPath, getChildren]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xl"}>
      <DialogTitle>{title}</DialogTitle>
      <Box
        sx={{
          position: "absolute",
          right: 10,
          top: 10,
        }}
      >
        <IconButton onClick={() => onClose()}>
          <CloseSharp />
        </IconButton>
      </Box>
      <DialogContent>
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
          >
            {columns?.map((_, i) => {
              return (
                <NestedObjectColumn
                  {...{ objectPath, onObjectPathChange }}
                  nestedObjects={columns}
                  label={label}
                  getChildren={getChildren}
                  index={i}
                  ListItemView={ListItemView}
                  DetailView={DetailView}
                />
              );
            })}
          </Box>
          {selectedObject && (
            <Box
              sx={{
                width: 200,
                height: 400,
                padding: 2,
                bgcolor: "ButtonShadow",
                overflow: "scroll",
              }}
            >
              <DetailView config={selectedObject} />
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export type NestedObjectColumnObjectType<T = any> = {
  ObjectIcon?: JSX.Element;
  ObjectDetail: React.FC<any>;

  objectName: string;
  objectDescription?: string; // #TODO - Think about it

  hasChildren: boolean;
  getChildren?: (o: T) => NestedObjectColumnObjectType[];

  onChange: (o: T) => void;
  object: T;

  selected: boolean;
};

type NestedObjectColumnProps = {
  label?: string;
  index: number;
  nestedObjects: NestedObjectUIListItem[][];
} & APIProps;
const NestedObjectColumn: React.FC<NestedObjectColumnProps> = ({
  objectPath,
  onObjectPathChange,
  nestedObjects,
  index,
  ListItemView,
}) => {
  const theme = useTheme();

  const currentSelectedID = objectPath?.[index];
  const parentObject: NestedObjectUIListItem | null =
    index <= 0
      ? null
      : nestedObjects[index - 1].find((o) => o.id === objectPath?.[index - 1])!;

  const [state, setState] = useGeneralState({ searchText: "" });

  const objects = state.searchText
    ? nestedObjects[index]?.filter((o) =>
        o.name.toLowerCase().includes(state.searchText?.toLocaleLowerCase())
      )
    : nestedObjects[index];

  return (
    <Box
      minWidth={200}
      maxWidth={400}
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
        <Typography variant="caption" height={20}>
          {parentObject?.name || ""}
        </Typography>
      </Box>
      <List>
        {objects?.map((o) => {
          const selected = currentSelectedID === o.id;
          return (
            <ListItemView
              onSelect={() => {
                console.log("this is pressed", o);
                const newNames = objectPath.slice(0, index + 1);
                newNames[index] = o.id;
                onObjectPathChange([...newNames]);
              }}
              selected={selected}
              config={o}
            />
          );
        })}
      </List>
    </Box>
  );
};
