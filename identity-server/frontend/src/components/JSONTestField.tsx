import { TextField, Typography } from "@mui/material";
import { useEffect, useReducer } from "react";

export const JSONTextField: React.FC<{
  object: any;
  onChange: (o: any) => void;
  label?: string;
}> = ({ object, onChange, label }) => {
  const [internalState, setInternalState] = useReducer(
    (p: any, c: any) => ({ ...p, ...c }),
    { objectError: "" }
  );

  useEffect(() => {
    if (internalState.parsedObject !== object) {
      setInternalState({ objectString: JSON.stringify(object, null, 2) });
    }
  }, [object]);

  return (
    <>
      <TextField
        fullWidth
        multiline
        label={label}
        onChange={(e) => {
          setInternalState({ objectString: e.target.value });
          try {
            const obj = JSON.parse(e.target.value);
            setInternalState({ parsedObject: obj, objectError: null });
            onChange(obj);
          } catch (e) {
            setInternalState({ objectError: "Invalid JSON object" });
          }
        }}
        value={internalState.objectString}
        error={!!internalState.objectError}
      ></TextField>
      {internalState.objectError && (
        <Typography variant="body2" color="error">
          {internalState.objectError}
        </Typography>
      )}
    </>
  );
};
