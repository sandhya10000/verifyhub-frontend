// Shared CSV export helper for the admin export buttons.
//
// Why a util: every admin page used to hand-roll its own CSV writer and each
// one got a different subset of the escaping rules right — commas were
// stripped out of names (mangling them), quotes were never escaped, files
// were saved without a UTF-8 BOM (Excel on Windows then mojibakes every
// non-ASCII name), and the object URL was never revoked.

// Escape one cell: wrap in quotes, double any inner quotes, and neutralise
// spreadsheet formula injection (=, +, @, tab, CR) so a hostile name can never
// be executed as a formula when the file is opened in Excel/Sheets.
const escapeCell = (value) => {
  if (value === null || value === undefined) return '""';

  let s = String(value);

  // Formula injection guard — only for values that are not plain numbers.
  const isNumeric = /^-?\d+(\.\d+)?$/.test(s.trim());
  if (!isNumeric && /^[=+@\t\r]/.test(s)) {
    s = `'${s}`;
  }

  return `"${s.replace(/"/g, '""')}"`;
};

const toCsvRow = (cells) => (cells || []).map(escapeCell).join(',');

// filename stamp, e.g. 2026-10-20_1435
export const fileStamp = (d = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
};

// Build a filename from parts, e.g. ['admin_transactions', 'from_2026-01-01']
// -> 'admin_transactions_from_2026-01-01.csv'
export const csvFilename = (parts, ext = 'csv') => {
  const clean = (parts || [])
    .filter(Boolean)
    .map((p) => String(p).replace(/[^a-zA-Z0-9._-]+/g, '-'))
    .join('_');
  return `${clean || 'export'}.${ext}`;
};

// Download a CSV. `header` is an array of column labels, `rows` an array of
// arrays. Returns the number of data rows written.
export const downloadCsv = (filename, header, rows) => {
  const body = rows || [];
  const csv = [header || [], ...body].map(toCsvRow).join('\r\n');

  // The BOM keeps Excel from decoding UTF-8 partner names/emails as Latin-1.
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the blob once the download has been handed to the browser.
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return body.length;
};

export default downloadCsv;
