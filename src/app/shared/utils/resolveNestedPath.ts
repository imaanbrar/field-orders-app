type Path = string | number | symbol;
type PathArray = Array<Path>;


export function resolveNestedPath(obj: object, path: Path | PathArray, separator: string = '.'): any {
  const properties = Array.isArray(path)
                     ? path : typeof path === 'string'
                              ? path.split(separator) : [ path ];

  return properties.reduce((prev, curr) => (prev != null) ? prev[curr] : prev, obj);
}
