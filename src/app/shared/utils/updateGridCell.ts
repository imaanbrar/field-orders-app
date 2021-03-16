import DevExpress from "devextreme";
import dxDataGrid = DevExpress.ui.dxDataGrid;
import dxDataGridRowObject = DevExpress.ui.dxDataGridRowObject;

export function updateGridCell(grid: dxDataGrid, row: dxDataGridRowObject, key: string, value: any) {
  if (row && !row.isNewRow) {
    const rowIndex = row.rowIndex;
    const current = grid.cellValue(rowIndex, key);
    if (current !== value) {
      grid.cellValue(rowIndex, key, value);
    }
  }
}
