import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';

/**
 * DataTable
 *
 * Props:
 *   title        – card header title text
 *   actionLabel  – text for the top-right action link (e.g. "All reports")
 *   onAction     – callback fired when the action link is clicked
 *   columns      – array of { header, field, render? }
 *   data         – array of row objects
 *   emptyMessage – string shown when data is empty
 *   headerContent- custom React node for the entire header (overrides title/actionLabel)
 */
const DataTable = ({
  columns,
  data,
  title,
  actionLabel,
  onAction,
  emptyMessage = 'No data available',
  headerContent,
}) => {
  const showHeader = title || actionLabel || headerContent;

  return (
    // Outer Paper — never scrolls; header lives here, safely outside any
    // overflow container so pointer events always work correctly.
    <Paper
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        overflow: 'hidden', // clips the inner TableContainer's border-radius
      }}
    >
      {/* ── Card header (title + action link) ─────────────────────────── */}
      {showHeader && (
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {headerContent ? (
            headerContent
          ) : (
            <>
              {title && (
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {title}
                </Typography>
              )}

              {actionLabel && (
                <Box
                  component="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof onAction === 'function') onAction();
                  }}
                  sx={{
                    all: 'unset',
                    color: '#12B886',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    lineHeight: 1,
                    userSelect: 'none',
                    '&:hover': { textDecoration: 'underline' },
                    '&:focus-visible': {
                      outline: '2px solid #12B886',
                      outlineOffset: '2px',
                      borderRadius: '2px',
                    },
                  }}
                >
                  {actionLabel} &rarr;
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {/* ── Scrollable table area ──────────────────────────────────────── */}
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              {columns.map((col, idx) => (
                <TableCell
                  key={idx}
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    py: 1.5,
                  }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, rowIdx) => (
              <TableRow
                key={rowIdx}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' },
                }}
              >
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx} sx={{ py: 2 }}>
                    {col.render ? col.render(row) : row[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 6, border: 0 }}
                >
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DataTable;
