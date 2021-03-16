export type ValueMap<T = number, U extends string | symbol | number = string, V extends {} = { [k in U]: T }> = {
  [k in number | keyof V]?: k extends keyof V ? T : keyof V;
}

export function getValueMapFromLookup<T = number, U extends string | symbol | number = string, V extends {} = { [k in U]: T }>(
  lookup: any[],
  full: boolean = true,
  value: string = 'value',
  display: string = 'text'
): ValueMap<T, U, V> {
  if (full) {
    return lookup.reduce((valueMap, data) => {
      let key = data[value];
      let text = data[display];

      if (typeof text === 'string') {
        text = text.trim();
      }

      valueMap[key] = text;
      valueMap[text] = key;
      return valueMap;
    }, {});
  } else {
    return lookup.reduce((valueMap, data) => {
      let key = data[value];
      let text = data[display];

      if (typeof text === 'string') {
        text = text.trim();
      }

      valueMap[key] = text;
      return valueMap;
    }, {});
  }
}
