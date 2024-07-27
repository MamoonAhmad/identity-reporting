import { Box, Grid, Typography } from "@mui/material";
import React, { PropsWithChildren } from "react";

export const PageTitle: React.FC<
  PropsWithChildren<{
    title: string;
  }>
> = ({ children, title }) => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
          <Typography sx={{ flexGrow: 1, textAlign: "left" }} variant="h3">
            {title}
          </Typography>
          {children}
        </Box>
      </Grid>
    </Grid>
  );
};
