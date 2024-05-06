import { TextField, Typography } from "@mui/material";
import { useEffect, useReducer } from "react";

export const CodeTestField: React.FC<{
  code: string;
  onChange: (o: any) => void;
  label?: string;
}> = ({ code: code, onChange, label }) => {
  const [internalState, setInternalState] = useReducer(
    (p: any, c: any) => ({ ...p, ...c }),
    { codeError: "" }
  );

  useEffect(() => {
    setInternalState({ codeString: code, codeError: getCodeError(code) });
  }, [code]);

  return (
    <>
      <TextField
        fullWidth
        multiline
        label={label}
        onChange={(e) => {
          const code = e.target.value;
          const codeError = getCodeError(code)
          setInternalState({ codeString: code, codeError });
          if(!codeError) {
            onChange(code)
          }
        }}
        value={internalState.codeString}
        error={!!internalState.codeError}
      ></TextField>
      {internalState.codeError && (
        <Typography variant="body2" color="error">
          {internalState.codeError}
        </Typography>
      )}
    </>
  );
};



const getCodeError = (code: string) => {
    try {
        eval(code)
        return null
    } catch (e) {
        return e?.toString()
    }
}