import React, { useMemo } from 'react';
import { Box, Typography, IconButton, Tooltip, Button, Select, MenuItem } from '@mui/material';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Pagination
 *
 * One shared control for every paginated table in the app so the admin panel
 * (and the partner panel) all read the same.
 *
 * Props:
 *   page        – current 1-based page number
 *   totalPages  – how many pages exist
 *   totalCount  – total rows across all pages (optional, enables the
 *                 "Showing X–Y of Z" range caption)
 *   pageSize    – rows per page (required when totalCount is given)
 *   onChange    – (nextPage) => void
 *   disabled    – greys the control out (e.g. while a fetch is in flight)
 *   compact     – hide the page-number buttons (mobile / narrow tables)
 *   label       – overrides the "Showing …" caption
 *
 *   onPageSizeChange  – (rows) => void. When provided, a "rows per page"
 *                       dropdown is rendered. The parent owns the page size
 *                       (it has to re-fetch with the new limit).
 *   pageSizeOptions   – choices for that dropdown
 */

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Builds the page-number window, e.g. [1, '…', 4, 5, 6, '…', 12]
const buildPageWindow = (current, total, max) => {
  if (total <= 1) return [];

  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const inner = Math.max(1, max - 2); // room for "1" and "total"
  const half = Math.floor(inner / 2);

  let start = Math.max(2, current - half);
  let end = Math.min(total - 1, start + inner - 1);
  start = Math.max(2, end - inner + 1);

  const pages = [1];
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);

  return pages;
};

const rangeLabel = (page, pageSize, totalCount) => {
  if (totalCount == null || !pageSize) return null;

  if (totalCount === 0) return 'No rows to show';

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalCount);

  return `Showing ${first.toLocaleString('en-IN')}–${last.toLocaleString('en-IN')} of ${totalCount.toLocaleString('en-IN')}`;
};

const Pagination = ({
  page = 1,
  totalPages = 1,
  totalCount = null,
  pageSize = null,
  onChange,
  disabled = false,
  compact = false,
  label = null,
  onPageSizeChange = null,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  sx = {},
}) => {
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const current = Math.min(Math.max(1, Number(page) || 1), safeTotalPages);

  const go = (next) => {
    if (disabled || typeof onChange !== 'function') return;
    const target = Math.min(Math.max(1, next), safeTotalPages);
    if (target !== current) onChange(target);
  };

  const caption = label || rangeLabel(current, pageSize, totalCount);
  const pages = compact ? [] : buildPageWindow(current, safeTotalPages, 7);

  // The active page size must always be selectable — a table that starts on
  // 20 rows would otherwise show an empty dropdown.
  const sizeOptions = useMemo(() => {
    const opts = (pageSizeOptions || [])
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0);

    const currentSize = Number(pageSize);

    if (Number.isFinite(currentSize) && currentSize > 0 && !opts.includes(currentSize)) {
      opts.push(currentSize);
    }

    return [...new Set(opts)].sort((a, b) => a - b);
  }, [pageSizeOptions, pageSize]);

  const btnSx = {
    width: 32,
    height: 32,
    borderRadius: 1,
    border: '1px solid',
    borderColor: '#E2E8F0',
    bgcolor: '#fff',
    color: '#475569',
    cursor: disabled ? 'default' : 'pointer',
    transition: 'background .15s, color .15s, border-color .15s, box-shadow .15s',
    '&:not(:disabled):hover': {
      bgcolor: '#EEF2FF',
      borderColor: '#C7D2FE',
      color: '#3730A3',
    },
    '&:not(:disabled):focus-visible': {
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(55,48,163,0.18)',
    },
  };

  const navBtn = (title, Icon, onClick, isDisabled) => (
    <Tooltip title={title} placement="top">
      <span>
        <IconButton
          onClick={onClick}
          disabled={disabled || isDisabled}
          aria-label={title}
          size="small"
          sx={btnSx}
        >
          <Icon size={16} strokeWidth={2.2} />
        </IconButton>
      </span>
    </Tooltip>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        px: 2.5,
        py: 1.5,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: '#FCFDFF',
        ...sx,
      }}
    >
      {/* Range caption + page-size dropdown */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', minWidth: 0, flex: '1 1 190px' }}>
        {onPageSizeChange && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Rows per page
            </Typography>
            <Select
              size="small"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={disabled}
              inputProps={{ 'aria-label': 'Rows per page' }}
              sx={{
                height: 32,
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#0F1E33',
                bgcolor: '#fff',
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C7D2FE' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3730A3' },
                '& .MuiSelect-select': { py: 0, px: 1.25, pr: '26px !important' },
                '& .MuiSelect-icon': { right: 6, fontSize: 18 },
              }}
            >
              {sizeOptions.map((n) => (
                <MenuItem key={n} value={n} sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}

        {caption && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {caption}
          </Typography>
        )}
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        {navBtn('First page', ChevronsLeft, () => go(1), current === 1)}

        {navBtn('Previous page', ChevronLeft, () => go(current - 1), current === 1)}

        {pages.length === 0 ? (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: '#0F1E33',
              px: 1,
              minWidth: 84,
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            Page {current} of {safeTotalPages}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {pages.map((p, idx) =>
              p === '…' ? (
                <Typography
                  key={`gap-${idx}`}
                  variant="body2"
                  sx={{ color: 'text.disabled', px: 0.25, userSelect: 'none' }}
                >
                  …
                </Typography>
              ) : (
                <Button
                  key={p}
                  onClick={() => go(p)}
                  disabled={disabled}
                  aria-current={p === current ? 'page' : undefined}
                  aria-label={`Page ${p}`}
                  disableElevation
                  sx={{
                    minWidth: 32,
                    height: 32,
                    px: 0.75,
                    borderRadius: 1,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    lineHeight: 1,
                    border: '1px solid',
                    borderColor: p === current ? '#3730A3' : '#E2E8F0',
                    bgcolor: p === current ? '#3730A3' : '#fff',
                    color: p === current ? '#fff' : '#475569',
                    transition: 'background .15s, color .15s, border-color .15s',
                    '&:not(:disabled):hover': {
                      bgcolor: p === current ? '#312a8c' : '#EEF2FF',
                      borderColor: p === current ? '#312a8c' : '#C7D2FE',
                      color: p === current ? '#fff' : '#3730A3',
                    },
                  }}
                >
                  {p}
                </Button>
              ),
            )}
          </Box>
        )}

        {navBtn('Next page', ChevronRight, () => go(current + 1), current === safeTotalPages)}

        {navBtn('Last page', ChevronsRight, () => go(safeTotalPages), current === safeTotalPages)}
      </Box>
    </Box>
  );
};

export default Pagination;
