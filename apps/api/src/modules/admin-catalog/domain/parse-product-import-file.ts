import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import {
  mapImportHeaders,
  rowFromMappedValues,
  type ProductImportColumn,
  type ProductImportRowInput,
  PRODUCT_IMPORT_COLUMNS,
} from './product-import.js';

const isSpreadsheet = (filename: string, mimeType: string): boolean => {
  const lower = filename.toLowerCase();
  return (
    lower.endsWith('.xlsx') ||
    lower.endsWith('.xls') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel')
  );
};

const isCsv = (filename: string, mimeType: string): boolean => {
  const lower = filename.toLowerCase();
  return (
    lower.endsWith('.csv') ||
    mimeType.includes('csv') ||
    mimeType === 'text/plain'
  );
};

const recordsFromMatrix = (
  matrix: unknown[][],
): ProductImportRowInput[] => {
  if (matrix.length < 2) {
    return [];
  }

  const headerRow = matrix[0].map((cell) => String(cell ?? ''));
  const mapping = mapImportHeaders(headerRow);
  const mappedColumns = Object.keys(mapping) as ProductImportColumn[];

  if (mappedColumns.length === 0) {
    throw new Error(
      `No recognized columns. Expected one of: ${PRODUCT_IMPORT_COLUMNS.join(', ')}`,
    );
  }

  const rows: ProductImportRowInput[] = [];

  for (let i = 1; i < matrix.length; i += 1) {
    const line = matrix[i];
    if (!line || line.every((cell) => String(cell ?? '').trim() === '')) {
      continue;
    }

    const values: Partial<Record<ProductImportColumn, unknown>> = {};
    for (const column of mappedColumns) {
      const index = mapping[column];
      if (index !== undefined) {
        values[column] = line[index];
      }
    }
    rows.push(rowFromMappedValues(values));
  }

  return rows;
};

export const parseProductImportFile = (file: {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}): ProductImportRowInput[] => {
  const { buffer, originalname, mimetype } = file;

  if (isSpreadsheet(originalname, mimetype)) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('Spreadsheet has no sheets.');
    }
    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
      header: 1,
      defval: '',
      raw: false,
    }) as unknown[][];
    return recordsFromMatrix(matrix);
  }

  if (isCsv(originalname, mimetype)) {
    const records = parse(buffer, {
      columns: false,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
      bom: true,
    }) as string[][];
    return recordsFromMatrix(records);
  }

  throw new Error('Unsupported file type. Upload a .csv or .xlsx file.');
};
