import { KeyTypes, verifyKeyTypes }            from "@app/shared/utils/verifyKeyTypes";
import { HasFieldVendor, mixinHasFieldVendor } from "@orders/mixins/order/has-field-vendor";
import { Order }                               from "@orders/models/order";
import IFieldOrder = FieldOrder.IFieldOrder;
import IOrder = Order.IOrder;

const MixinBase = mixinHasFieldVendor(Order);

export {
  FieldOrder,
  isFieldOrder
}

class FieldOrder extends MixinBase implements IFieldOrder {

  startDate?: string | Date;
  rasDate?: string | Date;

  readyForPurchase?: boolean;
  issuedToVendor?: boolean;

  goodsReceived?: string | Date;
  deliveryPoint?: string;

  originatorId?: number;
  shippingMethodId?: number;

  gst?: number;
  pst?: number;
  hst?: number;

  constructor(props: any) {
    super(props);
  }

  isValid(strict: boolean = false): this is IFieldOrder {
    return isFieldOrder(this, strict);
  }

}

function isFieldOrder(x: any, strict: boolean = false): x is IFieldOrder {
  const requiredKeys: KeyTypes<IFieldOrder> = {
    id       : 'number',
    name     : 'string',
    number   : 'string',
    projectId: 'number',
    statusId : 'number',
  };
  return verifyKeyTypes(x, requiredKeys, strict);
}

declare namespace FieldOrder {

  interface IFieldOrder extends IOrder, HasFieldVendor {
    startDate?: string | Date;
    rasDate?: string | Date;

    readyForPurchase?: boolean;
    issuedToVendor?: boolean;

    goodsReceived?: string | Date;
    deliveryPoint?: string;

    originatorId?: number;
    shippingMethodId?: number;

    fieldVendorId?: number;

    gst?: number;
    pst?: number;
    hst?: number;
  }
}
