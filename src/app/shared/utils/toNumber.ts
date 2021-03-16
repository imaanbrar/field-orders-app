export function toNumber(value: string | number | boolean | null | undefined): number | undefined {
  if (typeof value === 'number') {
    return value;
  } else if (value != undefined) {
    const test = Number(value);
    return !isNaN(test) ? test : undefined;
  }
  return undefined;
}
