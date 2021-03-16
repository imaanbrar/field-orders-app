export function toBoolean(value: string | number | boolean | null | undefined): boolean {
  if (typeof value === 'string') {
    value = value.toLowerCase();

    return value === 'true' ? true : !!+value;
  }

  return !!value;
}
