import "react-data-grid/lib/styles.css";

import ReactDataGrid, { Column, DataGridProps } from "react-data-grid";

export type ColumnWithSort<R> = Column<R> & { sortType?: string };

interface CustomDataGridProps<R> extends Omit<DataGridProps<R>, "rows" | "columns"> {
  rows: R[];
  columns: ColumnWithSort<R>[];
}

export default function DataGrid<R extends Record<string, string>>({
  rows,
  columns,
  ...props
}: CustomDataGridProps<R>) {
  return <ReactDataGrid {...props} className="fill-grid" columns={columns} rows={rows} />;
}
