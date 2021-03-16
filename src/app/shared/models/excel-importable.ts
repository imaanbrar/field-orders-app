import { Constructor }         from "@app/shared/mixins/mixins";

import { DxDataGridComponent } from "devextreme-angular";
import { dxDataGridRowObject } from "devextreme/ui/data_grid";
import { getAsDate } from '../utils/getAsDate';
import { getJsDateFromExcel } from '../utils/getJsDateFromExcel';
import { isDxDataGridRowObject } from '../utils/isDxDataGridRowObject';
import { setPropertyDescriptor } from '../utils/setPropertyDescriptor';
import { toBoolean } from '../utils/toBoolean';
import { toNumber } from '../utils/toNumber';
import { updateGridCell } from '../utils/updateGridCell';
import { KeyTypes } from '../utils/verifyKeyTypes';
import EntryConfig = ExcelImportable.EntryConfig;
import EntryFields = ExcelImportable.EntryFields;
import IExcelImportable = ExcelImportable.IExcelImportable;
import ItemConfig = ExcelImportable.ItemConfig;
import ItemFields = ExcelImportable.ItemFields;
import ItemTypes = ExcelImportable.ItemTypes;
import ItemField = ExcelImportable.ItemField;
import ItemType = ExcelImportable.ItemType;

export {
  ExcelImportable,
}

function ExcelImportable<I, E>() {

  abstract class ExcelImportable implements IExcelImportable<I, E> {

    protected get self(): typeof ExcelImportable {
      return <typeof ExcelImportable>this.constructor
    }

    protected static entryFields: EntryFields<I, E> = {};

    protected get entryKeys(): Array<string | number> {
      return Object.keys(this.self.entryFields);
    }

    protected static itemFields: ItemFields<I> = {};

    protected get itemKeys(): Array<string | number> {
      return Object.keys(this.self.itemFields);
    }

    protected static gridDataFields: ItemTypes<I> = {};

    protected static gridDataKeys: KeyTypes<I> = {};

    protected static emptyCollections: string[] = [];

    static isValidEntry(x: any): x is E {
      const fields = this.entryFields;

      return typeof x === 'object' && Object.keys(fields).reduce((valid, key) => {
        const config: EntryConfig<I> = fields[key];
        const validate = config.validate != undefined ? config.validate : true;

        return valid || (validate && x[key] != undefined);
      }, false);
    }

    static isGridRowObject(x: any): x is dxDataGridRowObject {
      return isDxDataGridRowObject(x, this.gridDataKeys, true);
    }

    protected constructor(entry: E | I | dxDataGridRowObject) {
      this.load(entry);

      this.hideEmptyCollections();
    }

    load(data: E | I | dxDataGridRowObject): void {

      if (this.self.isValidEntry(data)) {

        this.loadEntry(data);

      } else if (this.self.isGridRowObject(data)) {
        Object.assign(this, data.data);
      } else {
        Object.assign(this, data);
      }
    }

    protected loadEntry(entry: E): void {
      const fields = this.self.entryFields;

      this.entryKeys.forEach(field => {

        const config: EntryConfig<I> = fields[field];
        const default_ = typeof config.default === 'function' ? config.default() : config.default;
        const data = entry[field] == null ? default_ : entry[field];

        let value: string | number | boolean | Date;

        switch (config.type) {
          case "string":
            value = data.toString();
            break;
          case "number":
            value = toNumber(data);
            break;
          case "boolean":
            value = toBoolean(data);
            break;
          case "date":
            value = getJsDateFromExcel(data, new Date());
            break;
          default:
            const func = config.type;
            value = func(data);
        }

        if (value != undefined || !config.stripNull) {
          this[config.mapTo as string] = value;
        }
      })
    };

    protected hideEmptyCollections(): void {
      this.self.emptyCollections.forEach(collection => {
        setPropertyDescriptor(this, collection, { enumerable: false });
      });
    }

    isValid(): boolean {
      const fields = this.self.itemFields;

      return Object.keys(fields).reduce((valid, key) => {

        const config: ItemConfig<I> = fields[key];
        const validate = config.validate != undefined ? config.validate : true;

        return valid || (validate && this[key] != undefined);

      }, false);
    }

    updateGridRow(dataGrid: DxDataGridComponent, row: dxDataGridRowObject) {
      const grid = dataGrid.instance;

      this.itemKeys.forEach(key => {
        const config: ItemConfig<I> = this.self.itemFields[key];
        const update = config.update != undefined ? config.update : true;

        if (update) {
          switch (config.type) {
            case "date":
              const value = getAsDate(this[key], new Date());

              if (value.getTime() !== getAsDate(row.data[key], value).getTime()) {
                grid.cellValue(row.rowIndex, key as string, value);
              }
              break;
            case "string":
            case "boolean":
            case "number":
            default:
              updateGridCell(grid, row, key as string, this[key])
          }
        }
      });
    }

    equalTo(item: I | E | dxDataGridRowObject): boolean | undefined {
      return this.self.isValidEntry(item)
             ? this.compareToEntry(item)
             : this.self.isGridRowObject(item)
               ? this.compareToDataGridRow(item)
               : this.compareToItem(item);
    }

    private compareToEntry(entry: E) {
      const fields = this.self.entryFields;

      return Object.keys(fields).reduce((same, field) => {
        const config: EntryConfig<E> = fields[field];

        const value = this[config.mapTo as string];
        const type = config.type;
        const compare = config.compare != undefined ? config.compare : true;

        if (compare) {
          switch (type) {
            case "string":
              return same && value === entry[field].toString();
            case "number":
              return same && value === toNumber(entry[field]);
            case "boolean":
              return same && value === toBoolean(entry[field]);
            case "date":
              const date = getAsDate(value, new Date());
              return same && date.getTime() === getJsDateFromExcel(entry[field], date).getTime();
            default:
              return same && value === type(entry[field]);
          }
        }
      }, true);
    }

    private compareToItem(item: I): boolean {
      const fields = this.self.itemFields;

      return this.itemKeys.reduce((same, field) => {
        const value = this[field];
        const data = item[field];

        const config: ItemConfig<I> = fields[field];
        const compare = config.compare != undefined ? config.compare : true;
        const type = config.type

        if (compare) {
          switch (type) {
            case "string":
              return same && value === data.toString();
            case "number":
              return same && value === toNumber(data);
            case "boolean":
              return same && value === toBoolean(data);
            case "date":
              const date = getAsDate(value, new Date());
              return same && date.getTime() === getAsDate(data, date).getTime();
            default:
              return same && type(value, data);
          }
        }
      }, true);
    }

    private compareToDataGridRow(row: dxDataGridRowObject): boolean | undefined {
      const fields = this.self.gridDataFields;
      const keys = Object.keys(this.self.gridDataFields);

      if (keys.length === 0) {
        // undefined match means no candidate key is available; use row index to match instead
        return !row.isNewRow && row.rowType === 'data' ? undefined : false;
      } else {
        return !row.isNewRow && row.rowType === 'data' && keys.reduce((same, field) => {
          const type: ItemField | ((a: ItemType, b: ItemType) => boolean) = fields[field];

          const itemValue = this[field];
          const rowValue = row.data[field];

          switch (type) {
            case "string":
              return same && itemValue === rowValue.toString();
            case "number":
              return same && itemValue === toNumber(rowValue);
            case "boolean":
              return same && itemValue === toBoolean(rowValue);
            case "date":
              const date = getAsDate(itemValue, new Date());
              return same && date.getTime() === getAsDate(rowValue, date).getTime();
            default:
              return same && type(itemValue, rowValue);
          }
        }, true);
      }
    }
  }

  return ExcelImportable;
}


declare namespace ExcelImportable {

  interface IExcelImportableStatic<T extends IExcelImportable<I, E>, I, E> extends Constructor<T> {
    isValidEntry(x: any): x is E;

    isGridRowObject(x: any): x is dxDataGridRowObject;
  }

  interface IExcelImportable<I, E> {
    load(entry: E | I | dxDataGridRowObject): void;

    equalTo(entry: E | I | dxDataGridRowObject): boolean | undefined;

    isValid(): boolean;

    updateGridRow(dataGrid: DxDataGridComponent, row: dxDataGridRowObject): void;
  }

  type ItemType = string | number | boolean | Date | undefined | null;
  type EntryType = string | number | boolean | undefined | null;

  type EntryField = 'string' | 'number' | 'boolean' | 'date'

  type EntryConfig<I> = {
    type: EntryField | ((field: EntryType) => EntryType);
    mapTo: keyof I;
    default?: EntryType | (() => EntryType);
    stripNull?: boolean;
    compare?: boolean;
    validate?: boolean;
  }

  type EntryFields<I, E> = {
    [k in keyof E]?: EntryConfig<I>;
  }

  type ItemField = 'string' | 'number' | 'boolean' | 'date'

  type ItemFields<I> = {
    [k in keyof I]?: ItemConfig<I>
  }

  type ItemTypes<I> = {
    [k in keyof I]?: ItemField | ((a: ItemType, b: ItemType) => boolean);
  }

  type ItemConfig<I> = {
    type: ItemField | ((a: ItemType, b: ItemType) => boolean);
    compare?: boolean,
    validate?: boolean,
    update?: boolean,
  }

}
