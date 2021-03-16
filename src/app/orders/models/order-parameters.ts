import { Orders, isOrderType } from "@orders/shared/orders";
import IOrderParameters = OrderParameters.IOrderParameters;
import OrderType = Orders.OrderType;

export {
  OrderParameters
}

class OrderParameters implements IOrderParameters {
  readonly orderId?: number;
  readonly orderType: OrderType;

  constructor(props?: any) {
    if (props != null) {
      let { orderId, orderType } = props;

      this.orderId   = typeof orderId === 'number'
                       ? orderId
                       : typeof (orderId = Number(orderId)) === 'number'
                         ? orderId
                         : undefined;
      this.orderType = typeof orderType === 'string' && isOrderType(orderType = orderType.toLowerCase())
                       ? orderType
                       : undefined;

      if (this.orderType != orderType) {
        throw `Attempted to access unknown order type: '${ orderType }'${ orderId != undefined ? ` & id: '${ orderId }'` : '' }`;
      }
    }
  }
}

declare namespace OrderParameters {
  interface IOrderParameters {
    readonly orderType: OrderType,
    readonly orderId?: number
  }
}
