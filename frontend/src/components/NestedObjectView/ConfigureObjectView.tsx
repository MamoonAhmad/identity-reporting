import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  useTheme,
} from "@mui/material";
import { ArrayValidator, ObjectValidator, Validator } from "../../validators";
import { KeyboardArrowRightSharp } from "@mui/icons-material";
import { NestedObjectUIListItem } from "./NestedObjectView";
import { getIcon, hasChildren } from "./nestedObjectUtils";
import { FunctionValidator } from "../../validators/function";

export const GeneralObjectDetailView: React.FC<{
  config: NestedObjectUIListItem;
}> = ({ config }) => {
  if (config.object instanceof ObjectValidator) {
    return <ObjectValidatorDetailView {...(config as any)} />;
  } else if (config.object instanceof ArrayValidator) {
    return <ArrayValidatorDetailView {...(config as any)} />;
  } else if (config.object instanceof FunctionValidator) {
    return <FunctionValidatorDetailView {...(config as any)} />;
  } else if (config.object instanceof Validator) {
    return <LiteralValidatorDetailView {...(config as any)} />;
  }
  return null;
};

export const FunctionValidatorDetailView: React.FC<{
  object: FunctionValidator;
  onChange: (o: FunctionValidator) => void;
  name: string;
}> = ({ object, onChange, name }) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <Typography variant="h6">{name}</Typography>
      <FormControlLabel
        control={<Checkbox checked={object.config.ignore} />}
        onChange={(_, checked) => {
          onChange(
            new FunctionValidator({ ...object.config, ignore: checked })
          );
        }}
        label="Ignore "
      />
    </Box>
  );
};

export const ObjectValidatorDetailView: React.FC<{
  object: ObjectValidator;
  onChange: (o: ObjectValidator) => void;
  name: string;
}> = ({ object, onChange, name }) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <Typography variant="h6">{name}</Typography>
      <FormControlLabel
        control={<Checkbox checked={object.config.ignore} />}
        onChange={(_, checked) => {
          onChange(new ObjectValidator({ ...object.config, ignore: checked }));
        }}
        label="Ignore "
      />
    </Box>
  );
};

export const ArrayValidatorDetailView: React.FC<{
  object: ArrayValidator;
  onChange: (o: ArrayValidator) => void;
  name: string;
}> = ({ object, onChange, name }) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <Typography variant="h6">{name}</Typography>
      <FormControlLabel
        control={<Checkbox checked={object.config.ignore} />}
        onChange={(_, checked) => {
          onChange(new ArrayValidator({ ...object.config, ignore: checked }));
        }}
        label="Ignore "
      />
    </Box>
  );
};

export const LiteralValidatorDetailView: React.FC<{
  object: Validator;
  onChange: (o: Validator) => void;
  name: string;
}> = ({ object, onChange, name }) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <Typography variant="h6">{name}</Typography>
      <FormControlLabel
        control={<Checkbox checked={!object.config.ignore} />}
        value={object.config.ignore}
        onChange={(_, checked) => {
          onChange(new Validator({ ...object.config, ignore: checked }));
        }}
        label="Ignore "
      />
    </Box>
  );
};

export const ObjectListItemView: React.FC<{
  config: NestedObjectUIListItem;
  selected: boolean;
  onSelect: () => void;
}> = ({ config, selected, onSelect }) => {
  const icon = getIcon(config.object);
  const objectHasChildren = hasChildren(config.object);
  const theme = useTheme();
  return (
    <Button
      sx={{
        padding: 0,
        textDecoration: "none",
        textTransform: "none",
        display: "flex",
        alignItems: "center",
        backgroundColor: selected ? theme.palette.primary.light : "",
        color: selected
          ? theme.palette.primary.contrastText
          : theme.palette.text.secondary,
        ":hover": {
          backgroundColor: selected
            ? theme.palette.primary.dark
            : theme.palette.action.hover,
        },
      }}
      onClick={onSelect}
      fullWidth
    >
      <Box width={40}>{icon}</Box>
      <Typography variant="body2" sx={{ flexGrow: 1, textAlign: "left" }}>
        {config.name}
      </Typography>
      {objectHasChildren && <Box width={40}>{<KeyboardArrowRightSharp />}</Box>}
    </Button>
  );
};
