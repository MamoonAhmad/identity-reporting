import { AddSharp, RemoveSharp } from "@mui/icons-material";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useState } from "react";

const ObjectView: React.FC<{
  sourceObject: any;
  name: string;
}> = ({ sourceObject, name }) => {
  const [showChildren, setShowChildren] = useState(true);

  const targetObjectToIterateOver = sourceObject;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body2" sx={{ mr: 1 }}>
          {name ? `${name}:` : null} {"{"}
        </Typography>
        <IconButton
          sx={{ p: 0 }}
          onClick={() => setShowChildren(!showChildren)}
        >
          {showChildren ? (
            <RemoveSharp
              sx={{
                border: "1px solid black",
                fontSize: 12,
                cursor: "pointer",
              }}
            />
          ) : (
            <>
              <AddSharp
                fontSize="inherit"
                sx={{
                  border: "1px solid black",
                  fontSize: 12,
                  cursor: "pointer",
                  mr: 1,
                }}
              />
              <Typography>{"}"}</Typography>
            </>
          )}
        </IconButton>
      </Box>

      {/* Children */}
      {(showChildren && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: "column",
              ml: 0.2,
              mt: 1,
              pl: 2,
              borderLeft: "2px dashed black",
              "&:hover": {
                borderLeftColor: "blue",
              },
            }}
          >
            {Object.keys(targetObjectToIterateOver).map((k) => {
              return (
                <GeneralObjectView sourceObject={sourceObject?.[k]} name={k} />
              );
            })}
          </Box>
          <Typography>{"}"}</Typography>
        </>
      )) ||
        null}
    </Box>
  );
};

const ArrayView: React.FC<{
  sourceObject: any[];
  name: string;
}> = ({ sourceObject, name }) => {
  const hasChildren = !!sourceObject.length;
  const targetArrayToIterateOver = sourceObject;

  const [showChildren, setShowChildren] = useState(true);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body2" sx={{ mr: 1 }}>
          {name ? `${name}:` : null} {"["}
        </Typography>
        {hasChildren && (
          <IconButton
            sx={{ p: 0 }}
            onClick={() => setShowChildren(!showChildren)}
          >
            {showChildren ? (
              <RemoveSharp
                sx={{
                  border: "1px solid black",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              />
            ) : (
              <>
                <AddSharp
                  fontSize="inherit"
                  sx={{
                    border: "1px solid black",
                    fontSize: 12,
                    cursor: "pointer",
                    mr: 1,
                  }}
                />
                <Typography>{"]"}</Typography>
              </>
            )}
          </IconButton>
        )}
      </Box>

      {/* Children */}
      {(showChildren && (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: "column",
              ml: 0.2,
              mt: 1,
              pl: 2,
              borderLeft: "2px dashed black",
              "&:hover": {
                borderLeftColor: "blue",
              },
            }}
          >
            {targetArrayToIterateOver.map((_, k) => {
              return (
                <GeneralObjectView sourceObject={sourceObject?.[k]} name={""} />
              );
            })}
          </Box>
          <Typography>{"]"}</Typography>
        </>
      )) ||
        null}
    </Box>
  );
};

export const GeneralObjectView: React.FC<{
  sourceObject: any;
  name: string;
}> = (props) => {
  const { sourceObject } = props;
  if (Array.isArray(sourceObject)) {
    return <ArrayView {...props} />;
  } else if (sourceObject && typeof sourceObject === "object") {
    return <ObjectView {...props} />;
  } else {
    return <LiteralView {...props} />;
  }
};

const LiteralView: React.FC<{
  sourceObject: any;
  name: string;
}> = ({ sourceObject, name }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      {(sourceObject !== undefined && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 0.3,
          }}
        >
          <>
            <Typography variant="body2" sx={{ mr: 1 }}>
              {name ? `${name}:` : ""}
            </Typography>

            <Typography variant="body2" sx={{ mr: 1 }}>
              {JSON.stringify(sourceObject)}
            </Typography>
          </>
        </Box>
      )) ||
        null}
    </Box>
  );
};
