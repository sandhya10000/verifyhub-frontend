import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const DataTable = ({ columns, data, title, actionLabel, onAction }) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
      {(title || actionLabel) && (
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          {title && <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>}
          {actionLabel && (
            <Link to="#" onClick={onAction} style={{ color: '#12B886', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              {actionLabel} &rarr;
            </Link>
          )}
        </Box>
      )}
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            {columns.map((col, idx) => (
              <TableCell key={idx} sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.5 }}>
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIdx) => (
            <TableRow key={rowIdx} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
              {columns.map((col, colIdx) => (
                <TableCell key={colIdx} sx={{ py: 2 }}>
                  {col.render ? col.render(row) : row[col.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
