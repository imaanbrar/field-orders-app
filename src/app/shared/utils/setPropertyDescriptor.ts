export function setPropertyDescriptor(target: any, propertyKey: string, setDescriptor: PropertyDescriptor) {
  let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) ||
                   target.prototype && Object.getOwnPropertyDescriptor(target.prototype, propertyKey) || {
      configurable: true,
      writable    : true,
      enumerable  : true,
    };
  Object.assign(descriptor, setDescriptor);
  Object.defineProperty(target, propertyKey, descriptor);
}

interface PropertyDescriptor {
  configurable?: boolean;
  enumerable?: boolean;
  value?: any;
  writable?: boolean;
  get?: () => any;
  set?: (v: any) => void;
}
