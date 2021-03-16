export {
  verifyKeyTypes, KeyTypes
}

function verifyKeyTypes<T>(x: any, keyTypes: KeyTypes<T>, strict: boolean): boolean {
  return x != null &&
         typeof x === 'object' &&
         Object.keys(keyTypes)
               .reduce((found, key) => {
                 let inX       = key in x;
                 let value     = x[key];
                 let valueType = keyTypes[key];
                 if (inX && typeof value !== valueType) {
                   if (typeof valueType === 'function') {
                     if (!valueType(value)) {
                       console.warn(`Unexpected data type: {${ key }: ${ value }}. Value failed validation.`);
                       inX = !strict;
                     }
                   } else {
                     console.warn(`Unexpected data type: {${ key }: ${ value }}. Expected type '${ valueType }', but got type '${ typeof value }'.`);
                     inX = !strict;
                   }
                 } else if (!inX && strict) {
                   throw `Unexpected data: Required key '${ key }' not present.`;
                 }
                 return found && inX;
               }, true);
}

type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type KeyTypes<T> = {
  [k in keyof T]?: TypeName<T[k]> | Verifier<T[k]>
}

type Verifier<T> = (value: T) => boolean;
