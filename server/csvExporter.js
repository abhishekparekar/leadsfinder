/**
 * CSV Exporter with Formula Injection Mitigation (PRD Section 7.8)
 * Cells starting with =, +, -, or @ are prepended with a single quote (')
 * RFC 4180 compliant quoting and escaping.
 */

export function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '';
  let str = String(value);

  // Formula injection mitigation (PRD P0 requirement)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // If string contains comma, double quote or newline, wrap in quotes and escape internal quotes
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function generateCsv(rows, columns) {
  // columns: array of { key: string, label: string }
  const headerRow = columns.map(col => sanitizeCsvCell(col.label)).join(',');

  const dataRows = rows.map(row => {
    return columns.map(col => {
      let val = row[col.key];
      if (Array.isArray(val)) {
        val = val.join('; ');
      } else if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      return sanitizeCsvCell(val);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\r\n');
}
