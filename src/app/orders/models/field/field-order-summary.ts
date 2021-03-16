import { KeyTypes, verifyKeyTypes } from "@app/shared/utils/verifyKeyTypes";
import { OrderSummary }             from "@orders/models/order-summary";
import IFieldOrderSummary = FieldOrderSummary.IFieldOrderSummary;
import IOrderSummary = OrderSummary.IOrderSummary;

export {
  FieldOrderSummary,
  isFieldOrderSummary
}

class FieldOrderSummary extends OrderSummary {
  constructor(props: any) {
    super(props);
  }

  isValid(): this is IOrderSummary {
    return isFieldOrderSummary(this);
  }
}

function isFieldOrderSummary(x: any, strict: boolean = false): x is IFieldOrderSummary {
  const requiredKeys: KeyTypes<IFieldOrderSummary> = {
    id       : 'number',
    projectId: 'number',
    number   : 'string',
    name     : 'string',
    statusId : 'number',
    status   : 'string',
  };
  return verifyKeyTypes(x, requiredKeys, strict);
}

declare namespace FieldOrderSummary {

  interface IFieldOrderSummary extends IOrderSummary {
  }
}
