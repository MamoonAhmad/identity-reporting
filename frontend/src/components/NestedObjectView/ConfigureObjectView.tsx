import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Radio,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { ArrayValidator, ObjectValidator, Validator } from "../../validators";
import { KeyboardArrowRightSharp, WarningSharp } from "@mui/icons-material";
import { NestedObjectUIListItem } from "./NestedObjectView";
import { getIcon, hasChildren } from "./nestedObjectUtils";
import { FunctionValidator } from "../../validators/function";
import { useEffect } from "react";

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

      <FormControlLabel
        control={<Checkbox checked={object.config.isCalled} />}
        onChange={(_, checked) => {
          onChange(
            new FunctionValidator({ ...object.config, isCalled: checked })
          );
        }}
        label="Should be called."
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
      <FormControlLabel
        control={<Checkbox checked={object.config.strictEqual} />}
        onChange={(_, checked) => {
          onChange(
            new ObjectValidator({ ...object.config, strictEqual: checked })
          );
        }}
        label="Strict Equal"
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
      <FormControlLabel
        control={<Checkbox checked={object.config.matchOrder} />}
        onChange={(_, checked) => {
          onChange(
            new ArrayValidator({ ...object.config, matchOrder: checked })
          );
        }}
        label="Match Order"
      />
      {!object.config.matchOrder && (
        <Typography variant="subtitle1">
          <WarningSharp color="warning" fontSize="small" sx={{ mr: 1 }} />
          Not matching order can be a CPU intensive operation depending on the
          depth of object nesting on each index of the array.
        </Typography>
      )}
    </Box>
  );
};

const TARGET_VALUE_DATA_TYPES = {
  number: "number",
  string: "string",
  boolean: "boolean",
  null: "null",
};
const useTargetValueDataType = (value: any) => {
  if (value === null || value === undefined) {
    return TARGET_VALUE_DATA_TYPES.null;
  } else if (value?.__proto__ == Number.prototype) {
    return TARGET_VALUE_DATA_TYPES.number;
  } else if (value?.__proto__ == String.prototype) {
    return TARGET_VALUE_DATA_TYPES.string;
  } else if (value?.__proto__ == Boolean.prototype) {
    return TARGET_VALUE_DATA_TYPES.boolean;
  }
};

export const LiteralValidatorDetailView: React.FC<{
  object: Validator;
  onChange: (o: Validator) => void;
  name: string;
}> = ({ object, onChange, name }) => {
  const targetValueDataType = useTargetValueDataType(object.config.targetValue);

  useEffect(() => {
    if (!object.config?.dataType) {
      onChange(
        new Validator({ ...object.config, dataType: targetValueDataType })
      );
    }
  }, [targetValueDataType, object.config?.dataType]);

  const valueDataType = object.config?.dataType || targetValueDataType;

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
        control={<Checkbox checked={object.config.ignore} />}
        value={object.config.ignore}
        onChange={(_, checked) => {
          onChange(new Validator({ ...object.config, ignore: checked }));
        }}
        label="Ignore "
      />
      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="caption">Data Type</Typography>
        <FormControlLabel
          control={
            <Radio checked={valueDataType === TARGET_VALUE_DATA_TYPES.number} />
          }
          value={object.config.ignore}
          onClick={() => {
            onChange(
              new Validator({
                ...object.config,
                dataType: TARGET_VALUE_DATA_TYPES.number,
                targetValue: 0,
              })
            );
          }}
          label="Number"
        />
        <FormControlLabel
          control={
            <Radio checked={valueDataType === TARGET_VALUE_DATA_TYPES.string} />
          }
          value={object.config.ignore}
          onClick={() => {
            onChange(
              new Validator({
                ...object.config,
                dataType: TARGET_VALUE_DATA_TYPES.string,
                targetValue: "",
              })
            );
          }}
          label="String"
        />
        <FormControlLabel
          control={
            <Radio
              checked={valueDataType === TARGET_VALUE_DATA_TYPES.boolean}
            />
          }
          value={object.config.ignore}
          onClick={() => {
            onChange(
              new Validator({
                ...object.config,
                dataType: TARGET_VALUE_DATA_TYPES.boolean,
                targetValue: true,
              })
            );
          }}
          label="Boolean"
        />
        <FormControlLabel
          control={
            <Radio checked={valueDataType === TARGET_VALUE_DATA_TYPES.null} />
          }
          value={object.config.ignore}
          onClick={() => {
            onChange(
              new Validator({
                ...object.config,
                dataType: TARGET_VALUE_DATA_TYPES.null,
                targetValue: null,
              })
            );
          }}
          label="Null"
        />
      </Box>
      <Box sx={{ mt: 1 }}>
        {(valueDataType === TARGET_VALUE_DATA_TYPES.number ||
          valueDataType === TARGET_VALUE_DATA_TYPES.string) && (
          <TextField
            label="Expected Value"
            fullWidth
            value={object.config.targetValue}
            onChange={(e) => {
              const textFieldValue = e.target.value;
              const value =
                valueDataType === TARGET_VALUE_DATA_TYPES.number
                  ? parseFloat(textFieldValue)
                  : textFieldValue;
              onChange(
                new Validator({
                  ...object.config,
                  targetValue: value,
                })
              );
            }}
            multiline
          />
        )}
        {valueDataType === TARGET_VALUE_DATA_TYPES.boolean && (
          <Select
            value={object?.config?.targetValue?.toString()}
            onChange={(v) =>
              onChange(
                new Validator({
                  ...object.config,
                  targetValue: v.target.value === "true",
                })
              )
            }
          >
            <MenuItem value={"true"}>true</MenuItem>
            <MenuItem value={"false"}>false</MenuItem>
          </Select>
        )}
      </Box>
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
