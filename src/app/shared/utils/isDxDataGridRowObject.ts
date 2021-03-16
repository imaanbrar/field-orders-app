import { checkKeyTypes } from "@app/shared/utils/checkKeyTypes";
import { KeyTypes }      from "@app/shared/utils/verifyKeyTypes";
import DevExpress        from "devextreme";
import dxDataGridRowObject = DevExpress.ui.dxDataGridRowObject;

export function isDxDataGridRowObject<T>(
  x: any,
  requiredKeys: KeyTypes<T>,
  strict: boolean = false
): x is dxDataGridRowObject {
  const rowKeys: KeyTypes<dxDataGridRowObject> = {
    data    : 'object',
    rowIndex: 'number',
    rowType : 'string',
  };
  return x != null && typeof x === 'object' &&
         checkKeyTypes(x, rowKeys, false) &&
         checkKeyTypes(x.data, requiredKeys, strict);
}
