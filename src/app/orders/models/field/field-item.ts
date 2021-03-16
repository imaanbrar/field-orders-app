import { ExcelImportable } from "@app/shared/models/excel-importable";
import { ValueMap }        from "@app/shared/utils/getValueMapFromLookup";
import { toString }        from "@app/shared/utils/toString";
import { KeyTypes }        from "@app/shared/utils/verifyKeyTypes";
import { ScopeItem }       from "@orders/models/scope-item";
import DevExpress          from "devextreme";
import dxDataGridRowObject = DevExpress.ui.dxDataGridRowObject;
import EntryFields = ExcelImportable.EntryFields;
import ItemFields = ExcelImportable.ItemFields;
import IFieldEntry = FieldItem.IFieldEntry;
import IFieldItem = FieldItem.IFieldItem;
import ItemTypes = ExcelImportable.ItemTypes;

export {
  FieldItem
}

class FieldItem extends ExcelImportable<IFieldItem, IFieldEntry>() implements IFieldItem {

  id: number;
  orderId: number;

  itemNumber: number;

  quantity: number;
  uom: string;
  description: string;

  rev: number;
  isDeleted: boolean;

  wbsId: number;
  unitPrice: number;

  protected static entryFields: EntryFields<IFieldItem, IFieldEntry> = {
    Item: {
      type: 'number',
      mapTo: 'itemNumber',
      stripNull: true,
    },
    Quantity: {
      type: 'number',
      mapTo: 'quantity',
      default: 0,
    },
    UOM: {
      type: 'string',
      mapTo: 'uom',
    },
    Description: {
      type: 'string',
      mapTo: 'description',
    },
    Deleted: {
      type: 'boolean',
      mapTo: 'isDeleted',
    },
    WBS: {
      type: getWbsId,
      mapTo: 'wbsId',
    },
    "Unit Price": {
      type: 'number',
      mapTo: 'unitPrice',
      default: 0
    }
  };

  protected static itemFields: ItemFields<IFieldItem> = {
    itemNumber : { type: 'number' },
    quantity   : { type: 'number' },
    uom        : { type: 'string' },
    description: { type: 'string' },
    isDeleted  : { type: 'boolean' },
    wbsId      : { type: 'number' },
    unitPrice  : { type: 'number' },
  };

  protected static gridDataFields: ItemTypes<IFieldItem> = {
    itemNumber: 'number'
  };

  protected static gridDataKeys: KeyTypes<IFieldItem> = {
    itemNumber: 'number'
  };

  protected static emptyCollections = ScopeItem.emptyCollections;

  public static units: string[] = ScopeItem.units;

  public static wbs: ValueMap = {};

  constructor(entry: IFieldEntry | IFieldItem | dxDataGridRowObject) {
    super(entry);
  }
}

function getWbsId(wbs: string): number | undefined {
  return FieldItem.wbs[toString(wbs)];
}

declare namespace FieldItem {

  interface IFieldItem extends ScopeItem.Item {
    id: number;
    orderId: number;

    itemNumber: number;

    quantity: number;
    uom: string;
    description: string;

    rev: number;
    isDeleted: boolean;

    wbsId: number;
    unitPrice: number;

    createdBy?: number;
    createdDate?: string | Date;
    modifiedBy?: number;
    modifiedDate?: string | Date;
  }

  interface IFieldEntry extends ScopeItem.Entry{
    Item: number;
    Quantity: number;
    UOM: string;
    Description: string;
    Deleted: string;
    WBS: string;
    'Unit Price': number;
  }

}
