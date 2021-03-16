import DevExpress from "devextreme";

export function swapGridCells(grid: DevExpress.ui.dxDataGrid, aRowIndex: number, bRowIndex: number, key: string): boolean {
  const rows = grid.getVisibleRows();
  const aRow = rows[aRowIndex];
  const bRow = rows[bRowIndex];
  const valid = aRow && !aRow.isNewRow && bRow && !bRow.isNewRow;

  if (valid) {
    const itemNumber = aRow.data[key];

    grid.cellValue(aRowIndex, key, bRow.data[key]);
    grid.cellValue(bRowIndex, key, itemNumber);
  }

  return valid;
}
