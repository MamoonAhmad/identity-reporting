import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useMemo } from "react";

export const ListPage: React.FC<{
  keyColumnMap: {
    [key: string]: string;
  };
  columnOverride?: { [key: string]: React.FC<{ object: any }> };
  actions?: (o: any) => React.ReactNode;
  data: any[];
}> = ({ keyColumnMap, actions, columnOverride = {}, data }) => {
  const columns = useMemo(
    () => Object.keys(keyColumnMap).map((k) => keyColumnMap[k]),
    [keyColumnMap]
  );

  const objectKeys = Object.keys(keyColumnMap);

  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((col) => {
            return <TableCell>{col}</TableCell>;
          })}
          {actions && <TableCell>Action</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((d: any) => {
          return (
            <TableRow>
              {objectKeys.map((k) => (
                <TableCell>
                  {columnOverride[k] ? columnOverride[k]({ object: d }) : d[k]}
                </TableCell>
              ))}
              {actions ? actions(d) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
