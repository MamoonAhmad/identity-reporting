import React from "react";

import { getIcon, hasChildren } from "./nestedObjectUtils";
import { Box, Button, Typography, useTheme } from "@mui/material";
import {
  BugReportSharp,
  CheckSharp,
  CloseSharp,
  KeyboardArrowRightSharp,
} from "@mui/icons-material";
import { ArrayValidator, ObjectValidator, Validator } from "../../validators";
import { NestedObjectUIListItem } from "./NestedObjectView";

export const GenericTestDetailRunView: React.FC<{
  config: NestedObjectUIListItem;
}> = ({ config }) => {
  if (config.object instanceof ObjectValidator) {
    return <ObjectValidatorDetailView {...(config as any)} />;
  } else if (config.object instanceof ArrayValidator) {
    return <ArrayValidatorDetailView {...(config as any)} />;
  } else if (config.object instanceof Validator) {
    return <LiteralValidatorDetailView {...(config as any)} />;
  }
  return null;
};

const ObjectValidatorDetailView: React.FC<{
  object: ObjectValidator;
  onChange: (o: ObjectValidator) => void;
  name: string;
}> = ({ object, name }) => {
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
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
        }}
      >
        {object.isValid ? (
          <>
            <CheckSharp fontSize="large" color={"success"} />
            <Typography>Passed</Typography>
          </>
        ) : (
          <>
            <BugReportSharp fontSize="large" color={"error"} />
            <Typography>Failed</Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

const ArrayValidatorDetailView: React.FC<{
  object: ArrayValidator;
  onChange: (o: ArrayValidator) => void;
  name: string;
}> = ({ object, name }) => {
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
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
        }}
      >
        {object.isValid ? (
          <>
            <CheckSharp fontSize="large" color={"success"} />
            <Typography>Passed</Typography>
          </>
        ) : (
          <>
            <BugReportSharp fontSize="large" color={"error"} />
            <Typography>Failed</Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

const LiteralValidatorDetailView: React.FC<{
  object: Validator;
  onChange: (o: Validator) => void;
  name: string;
}> = ({ object, name }) => {
  const theme = useTheme();
  const isValid = object.isValid;
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

      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
        }}
      >
        {isValid ? (
          <>
            <CheckSharp fontSize="large" color={"success"} />
            <Typography>Passed</Typography>
          </>
        ) : (
          <>
            <BugReportSharp fontSize="large" color={"error"} />
            <Typography>Failed</Typography>
          </>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", my: 1 }}>
        <Typography sx={{ width: "auto" }}>
          Expected:{" "}
          <Typography
            bgcolor={theme.palette.success.light}
            color={theme.palette.success.dark}
            sx={{ ml: 1, px: 1, borderRadius: 1 }}
            component={"span"}
          >
            {JSON.stringify(object.config.targetValue)}
          </Typography>
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ my: 1, width: "auto" }}>
          Received:
          <Typography
            bgcolor={theme.palette.error.light}
            color={theme.palette.error.contrastText}
            sx={{ ml: 1, px: 1, borderRadius: 1 }}
            component={"span"}
          >
            {JSON.stringify(object.receivedValue)}
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
};

export const TestRunListItemView: React.FC<{
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
      onClick={() => {
        console.log(config.object, 'this is object', config.name)
        onSelect()
    }}
      fullWidth
    >
      <Box width={20} sx={{ display: "flex", justifyContent: "center", ml: 1 }}>
        {icon}
      </Box>
      <Box width={30}>
        {config.object?.isValid ? (
          <CheckSharp fontSize="medium" color="success" />
        ) : (
          <CloseSharp fontSize="medium" color="error" />
        )}
      </Box>
      <Typography variant="body2" sx={{ flexGrow: 1, textAlign: "left" }}>
        {config.name}
      </Typography>
      {objectHasChildren && <Box width={40}>{<KeyboardArrowRightSharp />}</Box>}
    </Button>
  );
};
