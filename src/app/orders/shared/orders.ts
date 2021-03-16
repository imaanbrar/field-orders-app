import { eControllers } from "@app/shared/enums/eControllers";
import { eOrderStatus } from "@app/shared/enums/eOrderStatus";
import OrderControllers = Orders.OrderControllers;
import OrderType = Orders.OrderType;
import OrderTypes = Orders.OrderTypes;

export {
  Orders,
  isOrderType,
  statusColor,
  orderControllers,
  orderTypes,
  defaultType,
}

const orderControllers: OrderControllers = {
  field   : 'FieldOrders'
};

const orderTypes: OrderTypes = {
  FieldOrder: 'field'
};

const defaultType: OrderType = 'field';

function isOrderType(x: any): x is OrderType {
  return (typeof x === 'string') && x in orderControllers;
}

function statusColor(statusId): string {
  switch (statusId) {
    case eOrderStatus.eInProgress:
      return 'badge badge-success status';
    case eOrderStatus.eClosed:
      return 'badge badge-secondary status';
    case eOrderStatus.eCancelled:
    case eOrderStatus.eReplaced:
      return 'badge badge-danger status';
    case eOrderStatus.eOnHold:
      return 'badge badge-warning status';
    default:
      return '';
  }
}

declare namespace Orders {

  type OrderType = 'field';

  type OrderControllers = {
    [k in OrderType]: eControllers.Key
  };

  type OrderTypes = {
    [k: string]: OrderType
  };

}
