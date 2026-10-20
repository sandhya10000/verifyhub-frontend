import axios from 'axios';
import { downloadCsv } from './csvExport';

// Shared "export everything that matches the current filters" helper.
//
// Why this exists: every admin export button used to serialise the table's
// React state, so the file only ever contained the rows visible on the
// current page (usually 50). The list endpoints already return `total` and
// `pages`, so we can simply walk every page and write the whole result set.

const DEFAULT_PAGE_SIZE = 200;

// Safety net so a runaway query can never hang the browser forever.
const DEFAULT_MAX_ROWS = 50000;

/**
 * Fetch every row matching a paginated list endpoint.
 *
 * @param {object}   opts
 * @param {string}   opts.url          endpoint (without query string)
 * @param {object}   opts.params       extra query params (filters)
 * @param {object}   opts.headers      auth headers
 * @param {number}   opts.pageSize     rows per request
 * @param {number}   opts.maxRows      hard cap on collected rows
 * @param {Function} opts.onProgress   called with (collected, total) per page
 * @returns {Promise<{ rows: Array, truncated: boolean, total: number }> }
 */
export const fetchAllPages = async ({
  url,
  params = {},
  headers = {},
  pageSize = DEFAULT_PAGE_SIZE,
  maxRows = DEFAULT_MAX_ROWS,
  onProgress = null,
} = {}) => {
  const collected = [];
  let total = null;
  let page = 1;
  let truncated = false;

  for (;;) {
    const query = new URLSearchParams({
      ...params,
      page: String(page),
      limit: String(pageSize),
    });

    const res = await axios.get(`${url}?${query.toString()}`, { headers });

    const body = res.data || {};

    if (!body.success) {
      throw new Error(body.message || 'Could not load data for export.');
    }

    const pageRows = Array.isArray(body.data) ? body.data : [];

    if (total === null) {
      total = Number.isFinite(body.total) ? body.total : null;
    }

    collected.push(...pageRows);

    if (typeof onProgress === 'function') {
      onProgress(collected.length, total);
    }

    // Stop conditions — any one of these ends the walk.
    // 1. The server has nothing more to give.
    if (pageRows.length === 0) break;
    // 2. We have every matching row.
    if (total !== null && collected.length >= total) break;
    // 3. The server told us how many pages there are (it always computes
    //    this from the *effective* limit, so it matches the rows per page we
    //    actually received).
    if (Number.isFinite(body.pages) && page >= body.pages) break;
    // 4. Safety cap — trim to exactly maxRows (a whole page can overshoot).
    if (collected.length >= maxRows) {
      truncated = true;
      if (collected.length > maxRows) collected.length = maxRows;
      break;
    }

    page += 1;
  }

  return { rows: collected, truncated, total: total ?? collected.length };
};

/**
 * Fetch every row matching a paginated list endpoint and write it to a CSV.
 *
 * @returns {Promise<{ written: number, truncated: boolean, total: number }> }
 */
export const exportAllToCsv = async ({
  url,
  params = {},
  headers = {},
  header = [],
  mapRow = (r) => r,
  filename = 'export.csv',
  pageSize = DEFAULT_PAGE_SIZE,
  maxRows = DEFAULT_MAX_ROWS,
  onProgress = null,
} = {}) => {
  const { rows, truncated, total } = await fetchAllPages({
    url,
    params,
    headers,
    pageSize,
    maxRows,
    onProgress,
  });

  const body = rows.map(mapRow);

  const written = downloadCsv(filename, header, body);

  return { written, truncated, total };
};

export default fetchAllPages;
