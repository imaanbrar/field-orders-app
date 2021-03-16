import { KeyTypes, verifyKeyTypes }        from "@app/shared/utils/verifyKeyTypes";
import { Orders, orderTypes, statusColor } from "@orders/shared/orders";
import OrderTypes = Orders.OrderTypes;
import IRecentOrder = RecentOrder.IRecentOrder;

export {
  RecentOrder,
  isRecentOrder
}

class RecentOrder implements IRecentOrder {
  public id?: number;

  public userId: number;

  public orderId: number;
  public orderType?: keyof OrderTypes;

  public name?: string;
  public number?: string;

  public companyName?: string;
  public companyNumber?: string;

  public projectId: number;
  public projectName?: string;
  public projectNumber?: string;

  public status?: string;
  public statusId?: number;

  public parentRevisionId?: number;
  public revisionNumber?: number;

  public createdDate?: string;

  isValid(): this is IRecentOrder {
    return isRecentOrder(this);
  }

  isComplete(): this is Required<RecentOrder> {
    return isFullRecentOrder(this);
  }

  constructor(props: any) {
    Object.assign(this, props);
  }

  get statusColor(): string {
    return statusColor(this.statusId);
  }

  get title(): string {
    let title: string;

    switch (orderTypes[this.orderType]) {
      case 'field':
        title = 'Field Order Number - Field Order Name';
        break;
      default:
        title = 'Order Number - Order Name';
    }

    return title;
  }

}

function isRecentOrder(x: any, strict: boolean = false): x is IRecentOrder {
  const requiredKeys: KeyTypes<IRecentOrder> = {
    orderId  : 'number',
    orderType: 'string',
  };
  return verifyKeyTypes(x, requiredKeys, strict);
}

function isFullRecentOrder(x: any, strict: boolean = false): x is Required<IRecentOrder> {
  const requiredKeys: KeyTypes<Required<IRecentOrder>> = {
    id              : 'number',
    userId          : 'number',
    orderId         : 'number',
    orderType       : 'string',
    number          : 'string',
    name            : 'string',
    statusId        : 'number',
    status          : 'string',
    revisionNumber  : 'number',
    parentRevisionId: 'number',
    projectId       : 'number',
    projectNumber   : 'string',
    projectName     : 'string',
    companyNumber   : 'string',
    companyName     : 'string',
    createdDate     : 'string',
  };
  return verifyKeyTypes<IRecentOrder>(x, requiredKeys, strict);
}

declare namespace RecentOrder {
  interface IRecentOrder {
    id?: number,
    userId: number,
    orderId: number,
    orderType?: keyof OrderTypes,
    number?: string,
    name?: string,
    statusId?: number,
    status?: string,
    revisionNumber?: number,
    parentRevisionId?: number,
    projectId: number,
    projectNumber?: string,
    projectName?: string,
    companyNumber?: string,
    companyName?: string,
    createdDate?: string,
  }
}
