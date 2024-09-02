import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useMemo } from "react";
import { Link } from "react-router-dom";

export const ListPage: React.FC<{
  keyColumnMap: {
    [key: string]: string;
  };
  columnOverride?: { [key: string]: React.FC<{ object: any }> };
  actions?: (o: any) => React.ReactNode;
  data: any[];
  viewLink?: (o: any) => string;
}> = ({
  keyColumnMap,
  actions,
  columnOverride = {},
  data,
  viewLink = () => "",
}) => {
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
                  <Link to={viewLink(d)}>
                    {columnOverride[k]
                      ? columnOverride[k]({ object: d })
                      : d[k]}
                  </Link>
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
