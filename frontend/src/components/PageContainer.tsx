import { Container } from "@mui/material";
import React from "react";

export const PageContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Container>{children}</Container>;
};
