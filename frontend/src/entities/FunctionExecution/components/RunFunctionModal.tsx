import { PlayArrowSharp } from "@mui/icons-material";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socketIO from "socket.io-client";

export const FunctionModal: React.FC<{
  onClose: () => void;
}> = ({ onClose = () => undefined }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeRunError, setCodeRunError] = useState("");

  return (
    <Modal open={true} onClose={onClose}>
      <Box
        sx={{
          width: "80vw",
          position: "absolute",
          maxHeight: "80vh",
          overflow: "scroll",
          transform: "translate(-50%, -50%)",
          top: "50%",
          left: "50%",
          background: theme.palette.background.paper,
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h4" sx={{ my: 2 }}>
          Run Code
        </Typography>
        <TextField
          multiline
          label="Python Code"
          sx={{ mb: 2 }}
          minRows={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {codeRunError && (
          <Box
            sx={{
              p: 1,
              bgcolor: "black",
              color: "white",
              my: 2,
              whiteSpace: "pre-wrap",
            }}
          >
            {codeRunError}
          </Box>
        )}
        <Button
          variant="contained"
          sx={{ mb: 2 }}
          onClick={() => {
            const socket = socketIO("http://localhost:8002");
            setLoading(true);
            socket.emit("message", {
              action: "executed_function/run_function_with_code",
              payload: {
                code
              }
            });
            socket.on(
              "executed_function/run_function_with_code:update",
              (data) => {
                console.log(data, "this is data");
              }
            );
            socket.on(
              "executed_function/run_function_with_code:error",
              (data) => {
                console.error(data, "this is error");
                setLoading(false);
                setCodeRunError(data);
                socket.close();
              }
            );
            socket.on(
              "executed_function/run_function_with_code:result",
              (executedFunctionID) => {
                setLoading(false);
                socket.close();
                onClose();
                navigate(
                  `/function-execution/view-function-execution/${executedFunctionID}`
                );
              }
            );
          }}
          disabled={loading}
        >
          <PlayArrowSharp /> Run
        </Button>
      </Box>
    </Modal>
  );
};
