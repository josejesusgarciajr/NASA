import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from "@mui/material";

import type { NEOCloseApproachData } from "../types/NASA/NEOFeedResponse";

type NEOCloseApproachTableProps = {
  closeApproaches: NEOCloseApproachData[];
}

interface Column {
  id: 'date' | 'orbitingBody' | 'velocity' | 'missDistance';
  label: string;
  minWidth?: number;
  align?: 'right';
}

const columns: readonly Column[] = [
  { id: "date", label: "Date", minWidth: 170 },
  { id: "orbitingBody", label: "Orbiting Body", minWidth: 100 },
  { id: "velocity", label: "Velocity (km/h)", minWidth: 170, align: "right" },
  { id: "missDistance", label: "Miss Distance (km)", minWidth: 170, align: "right" },
];

interface RowData {
  date: string;
  orbitingBody: string;
  velocity: number;
  missDistance: number;
}

interface Column {
  id: keyof RowData;
  label: string;
  minWidth?: number;
  align?: "right";
}

export const NEOCloseApproachTable = ({closeApproaches}: NEOCloseApproachTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const rows: RowData[] = useMemo(() => {
    return closeApproaches.map((approach) => ({
      date: approach.close_approach_date_full,
      orbitingBody: approach.orbiting_body,
      velocity: Number(approach.relative_velocity.kilometers_per_hour),
      missDistance: Number(approach.miss_distance.kilometers),
    }));
  }, [closeApproaches]);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow hover key={index}>
                  {columns.map((column) => {
                    const value = row[column.id];

                    return (
                      <TableCell key={column.id} align={column.align}>
                        {typeof value === "number"
                          ? value.toLocaleString()
                          : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(+e.target.value);
          setPage(0);
        }}
      />
    </Paper>
  );
};