export type Abstract<T = {}> = Function & { prototype: T };
export type Constructor<T extends {} = {}> = new(...args: any[]) => T;
export type Class<T = {}> = Constructor<T> & Abstract<T>;

export type Mixed<T extends Constructor, M extends Constructor> = T & M & Class<InstanceType<T> & InstanceType<M>>;
export type Mixin<T extends Constructor, M extends Constructor> = (base: T) => Mixed<T, M>;

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
    });
  });
}
