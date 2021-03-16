
export function arrayMove<T extends Array<any>>(array: T, oldIndex: number, newIndex: number): T {
  if (newIndex >= array.length) {
    let k = newIndex - array.length + 1;
    while (k--) {
      array.push(undefined);
    }
  }
  array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
  return array;
};
