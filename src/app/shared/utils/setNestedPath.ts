type Path = string | number | symbol;
type PathArray = Array<Path>;

export function setNestedPath(obj: object, value: any, path: Path | PathArray, separator: string = '.'): void {
  const properties = Array.isArray(path)
                     ? path : typeof path === 'string'
                              ? path.split(separator) : [ path ];

  const key  = properties.pop();
  const last = properties.reduce((prev, curr) => prev && prev[curr] || (prev[curr] = {}), obj);

  last[key] = value;
}
