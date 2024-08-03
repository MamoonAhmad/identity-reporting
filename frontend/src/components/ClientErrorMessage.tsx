import { Typography, TypographyProps } from "@mui/material";

export const ClientErrorMessage: React.FC<
  Omit<TypographyProps, "children"> & { message: string }
> = (props) => {
  return (
    <>
      {props.message.split("\n").map((m, i) => (
        <Typography key={`client-error-${i}`} {...props}>
          {m}
        </Typography>
      ))}
    </>
  );
};
