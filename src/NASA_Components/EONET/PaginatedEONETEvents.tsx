// nasa
import type { EONETEvent } from "../../types/NASA/EONET"

// material ui
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

interface Column {
  id: 'title' | 'categories' | 'geometry';
  label: string;
  minWidth?: number;
  align?: 'right';
}

const columns: readonly Column[] = [
  { id: "title", label: "Natural Event", minWidth: 170 },
  { id: "categories", label: "Category", minWidth: 100 },
  { id: "geometry", label: "Location", minWidth: 170, align: "right" },
];

type PaginatedEONETEventsProps = {
    eonetEvents: EONETEvent[]
    page: number;
    setPage: (page: number) => void;
    rowsPerPage: number;
    setRowsPerPage: (rowsPerPage: number) => void;
    sortedColumn: string;
    sortByColumn: (column: string) => void;
    sortDesc: boolean;
}

export const PaginatedEONETEvents = ({ eonetEvents, page, setPage, rowsPerPage, 
    setRowsPerPage, sortedColumn, sortByColumn, sortDesc }: PaginatedEONETEventsProps) => {

    const rows = eonetEvents.map(event => ({
        title: event.title,
        categories: event.categories.map(c => c.title).join(', '),
        geometry: event.geometry.length > 0
            ? `${event.geometry[0].coordinates[1].toFixed(2)}, ${event.geometry[0].coordinates[0].toFixed(2)}`
            : 'N/A',
    }))

    function handleColumnSort(column: string) {
        sortByColumn(column)
    }

    return (
        <Paper
            sx={{
                width: "100%",
                overflow: "hidden",
                border: '1px solid rgba(56,189,248,0.2)',
                boxShadow: '0 0 24px rgba(56,189,248,0.06)',
            }}
        >
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
                                        fontSize: { xs: '0.6rem', md: '0.875rem' },
                                        backgroundColor: 'rgba(3, 105, 161, 0.35)',
                                        color: '#e2e8f0',
                                        fontWeight: 'bold',
                                        letterSpacing: '0.07em',
                                        textTransform: 'uppercase',
                                        borderBottom: '2px solid rgba(56,189,248,0.4)',
                                    }}
                                >
                                    <TableSortLabel
                                        sx={{
                                            '& .MuiTableSortLabel-icon': {
                                                display: { xs: column.id ? 'block' : 'none', md: 'block' },
                                                fontSize: { xs: '0.6rem', md: '1rem' }
                                            },
                                            fontSize: { xs: '0.55rem', md: '0.875rem' }
                                        }}
                                        onClick={() => handleColumnSort(column.id)}
                                        direction={sortDesc ? 'desc' : 'asc'}
                                        active={sortedColumn === column.id}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, index) => (
                                <TableRow hover key={index} sx={{ backgroundColor: 'inherit' }}>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                sx={{ fontSize: { xs: '0.6rem', md: '0.875rem' } }}
                                            >
                                                {value}
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
    )
}