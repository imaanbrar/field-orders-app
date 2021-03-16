export function toString(value: string | number | boolean | null | undefined, trim: boolean = false, empty: string = ''): string | undefined {
  if (value != undefined) {
    let str = trim ? value.toString().trim() : value.toString();

    if (str.length === 0) {
      str = empty;
    }

    return str;
  }
  return undefined;
}
