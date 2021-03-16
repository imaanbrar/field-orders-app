import { isArray, isObject } from "util";

export {
  squashGroupedData
}

type GroupedDataBranch = { key: string | number, items: GroupedData };
type GroupedDataLeaf = { key: string | number | string[], items: Array<{ [k in string]: any }> };
type SquashedData<T> = Array<{ rowIndex: number, item: T }>;

interface GroupedData extends Array<GroupedDataBranch | GroupedDataLeaf | { [k in string]: any }> {}

function squashGroupedData<T>(data: GroupedData): SquashedData<T>;
function squashGroupedData<T>(data: GroupedData, rowIndex: number): SquashedData<T>;
function squashGroupedData<T>(data: GroupedData, rowIndex?: number): SquashedData<T> {

  rowIndex = rowIndex || 0;

  return data.reduce<SquashedData<T>>((squashed, item) => {
    if (isObject(item) && Object.keys(item).length === 1 && item.hasOwnProperty('items') && Array.isArray(item.items)) {
      item.key = [];
    }

    if (isGroupedDataBranch(item)) {
      squashGroupedData<T>(item.items, rowIndex + 1)
        .forEach(leaf => {
          squashed.push(leaf);
        });
    } else if (isGroupedDataLeaf(item)) {
      rowIndex++;
      item.items.forEach((leaf, index) => {
        squashed.push({
          rowIndex: rowIndex + index,
          item: <T>leaf
        });
      });

    } else {
      const items = Array.isArray(item) ? item : [ item ];
      items.forEach((leaf, index) => {
        squashed.push({
          rowIndex: rowIndex + index,
          item: <T>leaf
        });
      });
    }

    rowIndex = squashed[squashed.length - 1].rowIndex + 1;

    return squashed;
  }, []);
}

function isGroupedDataBranch(x: any): x is GroupedDataBranch {
  if (isObject(x)) {
    const keys = Object.keys(x);
    if ((keys.length === 2 && x.hasOwnProperty('key') && x.hasOwnProperty('items')) ||
        (keys.length === 1 && x.hasOwnProperty('items'))) {
      const items = x.items;
      if (Array.isArray(items)) {
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
