import { FilterAltSharp } from "@mui/icons-material";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

export type FilterObjectType = { [key: string]: any };
export const Filter: React.FC<{
  title: string;
  filters: FilterObjectType;
  filterMap: FilterObjectType;
  onFilter: (o: FilterObjectType) => void;
}> = ({ title, filterMap, onFilter, filters }) => {
  const [filterObject, setFilterObject] = useState<FilterObjectType>({});
  useEffect(() => {
    setFilterObject({ ...filters });
  }, [filters]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FilterAltSharp sx={{ mr: 1 }} />
              <Typography variant="body2">{title}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {Object.keys(filterMap).map((k) => (
                <Grid item xs={12} my={0.5}>
                  <TextBox
                    key={k}
                    label={filterMap[k]}
                    value={filterObject[k] || ""}
                    onChange={(v) =>
                      setFilterObject({ ...filterObject, [k]: v })
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
          <AccordionActions sx={{ justifyContent: "flex-start", px: 2 }}>
            <Button onClick={() => onFilter(filterObject)}>
              <FilterAltSharp sx={{ mr: 1 }} fontSize="inherit" />
              Filter
            </Button>
          </AccordionActions>
        </Accordion>
      </Grid>
    </Grid>
  );
};

const TextBox: React.FC<{
  label: string;
  value: string;
  onChange: (s: string) => void;
}> = React.memo(({ label, value, onChange }) => {
  return (
    <TextField
      fullWidth
      value={value}
      label={label}
      size="small"
      onChange={(e) => onChange(e.target.value)}
    />
  );
});
