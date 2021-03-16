import { Constructor }           from "@app/shared/mixins/mixins";
import { setPropertyDescriptor } from "@app/shared/utils/setPropertyDescriptor";
import { Order }                 from "@orders/models/order";
import { FieldVendor }           from "@orders/models/field/field-vendor";

export interface HasFieldVendor {
  fieldVendor: FieldVendor;
}

function isEmpty(value: string) {
  return value == undefined || value.trim().length === 0;
}

export function mixinHasFieldVendor<T extends Constructor<Order>>(base: T): T & Constructor<HasFieldVendor> {
  class HasFieldVendor extends base implements HasFieldVendor {

    private _fieldVendor: FieldVendor[];

    get fieldVendor(): FieldVendor {
      return this._fieldVendor[0];
    }

    set fieldVendor(fieldVendor: FieldVendor) {
      if (Array.isArray(fieldVendor)) {
        this._fieldVendor = fieldVendor.length > 0
                            ? fieldVendor.map(data => new FieldVendor(this.id, data))
                            : [ new FieldVendor(this.id, {}) ];
      } else {
        this._fieldVendor = [ new FieldVendor(this.id, fieldVendor || {}) ];
      }
    }

    constructor(...args: any[]) {
      super(...args);

      setPropertyDescriptor(this, '_fieldVendor', { enumerable: false });

      delete this.fieldVendor;
    }

    load(props: any) {
      super.load(props);

      this.fieldVendor = props.fieldVendor;
    }

    save(): void {
      super.save();
      this.fieldVendor.save();
    }

    public hasChanged(e: string, compare?: (a: any, b: typeof a) => boolean): boolean {
      if (e.startsWith('fieldVendor')) {
        return this.fieldVendor.hasChanged(e, compare);
      } else {
        return super.hasChanged(e, compare);
      }
    }

    public isValid(strict: boolean = false): boolean {
      return super.isValid(strict) && this.fieldVendor.isValid();
    }

    public toJSON() {
      return Object.assign({
        fieldVendor: this._fieldVendor
      }, super.toJSON());
    }
  }

  setPropertyDescriptor(HasFieldVendor, 'fieldVendor', { enumerable: true });

  return HasFieldVendor;
}
