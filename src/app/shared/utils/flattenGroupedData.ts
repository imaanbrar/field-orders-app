import { isObject } from 'util';
import { setPropertyDescriptor } from "@app/shared/utils/setPropertyDescriptor";
import { toString }              from "@app/shared/utils/toString";

export {
  flattenGroupedData
}

type GroupedDataBranch = { key: string | number, items: GroupedData };
type GroupedDataLeaf = { key: string | number | string[], items: Array<{ [k in string]: any }> };
type FlattenedData = GroupedDataLeaf[];

interface GroupedData extends Array<GroupedDataBranch | GroupedDataLeaf | { [k in string]: any }> {}

function flattenGroupedData(data: GroupedData): FlattenedData;
function flattenGroupedData(data: GroupedData, rowIndex: number): FlattenedData;
function flattenGroupedData(data: GroupedData, rowIndex?: number): FlattenedData {

  rowIndex = rowIndex || 0;

  return data.reduce<FlattenedData>((leafData, item) => {
    if (isObject(item) && Object.keys(item).length === 1 && item.hasOwnProperty('items') && Array.isArray(item.items)) {
      item.key = [];
    }

    if (isGroupedDataBranch(item)) {
      const leaves = flattenGroupedData(item.items, rowIndex + 1);
      const itemKey = toString(item.key, true, null);

      leaves.forEach(leaf => {
        const key = Array.isArray(leaf.key) ? leaf.key : [ leaf.key.toString() ];

        if (itemKey != undefined) {
          key.unshift(itemKey);
        }

        leafData.push({
          key  : key,
          items: leaf.items
        });
      });

    } else if (isGroupedDataLeaf(item)) {
      let itemKey = item.key;

      item.key = [];

      if (itemKey != undefined) {
        if (Array.isArray(itemKey)) {
          item.key = itemKey;
        } else {
          itemKey = toString(itemKey, true);
          if (itemKey.length > 0) {
            item.key.push(itemKey);
          }
        }
      }

      item.items.forEach((item, index) => setRowIndex(item,  rowIndex + index + 1));

      leafData.push(item);
    } else {
      const key = [];
      const items = isArray(item) ? item : [ item ];

      items.forEach((item, index) => setRowIndex(item, rowIndex + index));

      leafData.push({key, items});
    }

    const lastItem = leafData[leafData.length - 1];
    rowIndex = lastItem.items[lastItem.items.length - 1].__rowIndex__ + 1;

    return leafData;
  }, []);
}

function setRowIndex(item: any, value: number) {
  if (item.hasOwnProperty('__rowIndex__')) {
    item.__rowIndex__ = value;
  } else {
    setPropertyDescriptor(item, '__rowIndex__', {
      enumerable  : false,
      configurable: false,
      writable    : true,
      value       : value,
    });
  }
}

function isGroupedDataBranch(x: any): x is GroupedDataBranch {
  if (isObject(x)) {
    const keys = Object.keys(x);
    if ((keys.length === 2 && x.hasOwnProperty('key') && x.hasOwnProperty('items')) ||
        (keys.length === 1 && x.hasOwnProperty('items'))) {
      const items = x.items;
      if (isArray(items)) {
        return items.every(item => {
          const keys = Object.keys(item);
          return (keys.length === 2 && item.hasOwnProperty('key') && item.hasOwnProperty('items')) ||
                 (keys.length === 1 && item.hasOwnProperty('items'));
        });
      }
    }
  }
  return false;
}

function isGroupedDataLeaf(x: any): x is GroupedDataLeaf {
  if (isObject(x)) {
    const keys = Object.keys(x);
    return (keys.length === 2 && x.hasOwnProperty('key') && x.hasOwnProperty('items')) ||
           (keys.length === 1 && x.hasOwnProperty('items'));
  }
  return false;
}
