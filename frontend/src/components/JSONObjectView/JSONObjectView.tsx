import { Grid } from "@mui/material";
import React from "react";

export const JSONObjectView: React.FC<{ object: any }> = ({ object }) => {
  if (Array.isArray(object)) {
  } else if (object instanceof Object) {
  } else {
  }
  return null;
};

const ObjectView = ({ object }) => {
  Object.keys(object).map((k) => {
    const value = object[k];
    return <Grid display={"flex"}></Grid>;
  });
};
const ArrayView = () => {};
const LiteralView = () => {};
