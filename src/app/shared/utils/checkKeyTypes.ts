import { KeyTypes } from "@app/shared/utils/verifyKeyTypes";

export function checkKeyTypes<T>(x: any, keyTypes: KeyTypes<T>, strict: boolean): boolean {
  return x != null &&
         typeof x === 'object' &&
         Object.keys(keyTypes)
               .reduce((valid, key) => {
                 let inX       = key in x;
                 let value     = x[key];
                 let valueType = keyTypes[key];
                 if (inX && typeof value !== valueType) {
                   if (typeof valueType === 'function') {
                     inX = valueType(value);
                   } else {
                     inX = !strict;
                   }
                 }
                 return valid && inX;
               }, true);
}
