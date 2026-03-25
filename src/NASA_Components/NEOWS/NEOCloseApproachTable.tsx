import { useMemo } from "react";
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
import TableSortLabel from '@mui/material/TableSortLabel';

import type { NEOCloseApproachData } from "../../types/NASA/NEOFeedResponse";

type NEOCloseApproachTableProps = {
  closeApproaches: NEOCloseApproachData[];
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rowsPerPage: number) => void;
  sortBy: (sortColumn: string, desc: boolean) => void;
  sortByColumn: string;
  desc: boolean;
  units: string;
  startDateRangeStr: string;
  endDateRangeStr: string;
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

export const NEOCloseApproachTable = ({closeApproaches, page, setPage, rowsPerPage, setRowsPerPage, sortBy, 
  sortByColumn, desc, units, startDateRangeStr, endDateRangeStr}: NEOCloseApproachTableProps) => {

  const rows: RowData[] = useMemo(() => {
    if (units === 'miles') {
      return closeApproaches.map((approach) => ({
        date: approach.close_approach_date_full,
        orbitingBody: approach.orbiting_body,
        velocity: Number(approach.relative_velocity.miles_per_hour),
        missDistance: Number(approach.miss_distance.miles),
      }));
    }

    return closeApproaches.map((approach) => ({
      date: approach.close_approach_date_full,
      orbitingBody: approach.orbiting_body,
      velocity: Number(approach.relative_velocity.kilometers_per_hour),
      missDistance: Number(approach.miss_distance.kilometers),
    }));
  }, [closeApproaches, units]);

  function handleSortBy(sortColumn: string) {
    const sortDesc = !desc;
    sortBy(sortColumn, sortDesc);
  }

  function generateColumnHeader(column: Column) {
    switch(units) {
      case 'miles' :
        if (column.id === 'velocity') {
          return 'Velocity (mph)';
        } else if (column.id === 'missDistance') {
          return 'Miss Distance (mi)';
        } else {
          return column.label;
        }
      default:
        return column.label;
    }
  }

function isWithinWeek(dateStr: string) {
    // dateStr format: "2026-Mar-11 12:19"
    const months: Record<string, string> = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    const [datePart] = dateStr.split(' ');        // "2026-Mar-11"
    const [year, monthAbbr, day] = datePart.split('-'); // ["2026", "Mar", "11"]
    const month = months[monthAbbr];

    const dateOnly = `${year}-${month}-${day.padStart(2, '0')}`;

    return dateOnly >= startDateRangeStr && dateOnly <= endDateRangeStr;
}

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: { xs: '60vh', md: 400 } }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                    key={column.id}
                    align={column.align}
                    sx={{ 
                        minWidth: { xs: 70, md: column.minWidth },
                        fontSize: { xs: '0.6rem', md: '0.875rem' }
                    }}
                    onClick={() => handleSortBy(column.id)}
                >
                  <TableSortLabel
                      active={sortByColumn === column.id}
                      direction={sortByColumn === column.id ? (desc ? 'desc' : 'asc') : 'desc'}
                      sx={{
                          '& .MuiTableSortLabel-icon': {
                              display: { xs: sortByColumn === column.id ? 'block' : 'none', md: 'block' },
                              fontSize: { xs: '0.6rem', md: '1rem' }
                          },
                          fontSize: { xs: '0.55rem', md: '0.875rem' }
                      }}
                  >
                      {generateColumnHeader(column)}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow
                  hover 
                  key={index} 
                  sx={{
                    backgroundColor: isWithinWeek(row.date) 
                        ? 'rgba(25, 118, 210, 0.15)' 
                        : 'inherit'
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];

                    return (
                      <TableCell key={column.id} align={column.align}
                          sx={{ fontSize: { xs: '0.6rem', md: '0.875rem' } }}
                      >
                          {typeof value === "number" ? Number(value.toFixed(2)).toLocaleString() : value}
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
        sx={{
          '.MuiTablePagination-toolbar': {
              fontSize: { xs: '0.6rem', md: '0.875rem' },
              paddingLeft: { xs: '8px', md: '16px' },
              paddingRight: { xs: '4px', md: '8px' },
          },
          '.MuiTablePagination-selectLabel': {
              fontSize: { xs: '0.6rem', md: '0.875rem' },
          },
          '.MuiTablePagination-displayedRows': {
              fontSize: { xs: '0.6rem', md: '0.875rem' },
          },
          '.MuiTablePagination-select': {
              fontSize: { xs: '0.6rem', md: '0.875rem' },
          },
      }}
      />
    </Paper>
  );
};