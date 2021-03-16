import { eOrderStatus }                                                       from "@app/shared/enums/eOrderStatus";

import { getAsDate } from '@app/shared/utils/getAsDate';
import { getJsDateFromExcel } from '@app/shared/utils/getJsDateFromExcel';
import { isDxDataGridRowObject } from '@app/shared/utils/isDxDataGridRowObject';
import { setPropertyDescriptor } from '@app/shared/utils/setPropertyDescriptor';
import { toBoolean } from '@app/shared/utils/toBoolean';
import { toNumber } from '@app/shared/utils/toNumber';
import { updateGridCell } from '@app/shared/utils/updateGridCell';
import { KeyTypes } from '@app/shared/utils/verifyKeyTypes';
import { Orders, orderTypes }                                                 from "@orders/shared/orders";
import { OnChange }                                                           from "property-watch-decorator";
import IOrder = Order.IOrder;
import OrderType = Orders.OrderType;
import OrderTypes = Orders.OrderTypes;
import { resolveNestedPath } from 'src/app/shared/utils/resolveNestedPath';
import { verifyKeyTypes } from 'src/app/shared/utils/verifyKeyTypes';

export {
  Order,
  isOrder
}

class Order implements IOrder {
  public id: number;
  public name: string;
  public number: string;
  public projectId: number;

  public orderType: keyof OrderTypes;

  @OnChange('resolveReadOnly')
  public statusId: number;

  public readOnly: boolean = true;

  @OnChange('resolveReadOnly')
  public accessible: boolean = false;

  public parentRevisionId?: number;
  public revisionNumber?: number;
  public revisionDate?: string;

  public createdBy?: number;
  public createdDate?: string;
  public modifiedBy?: number;
  public modifiedDate?: string;

  protected initialData: IOrder;
  protected excludedFields = [];

  constructor(props: any) {

    this.load(props);

    if (this.excludedFields.indexOf('project') === -1) {
      this.excludedFields.push('project');
    }

    setPropertyDescriptor(this, 'excludedFields', { enumerable: false });

    setPropertyDescriptor(this, 'orderActivity', { enumerable: false });
    setPropertyDescriptor(this, 'orderChangeOrder', { enumerable: false });
    setPropertyDescriptor(this, 'orderComment', { enumerable: false });
    setPropertyDescriptor(this, 'orderDoc', { enumerable: false });
    setPropertyDescriptor(this, 'orderInvoice', { enumerable: false });
    setPropertyDescriptor(this, 'orderItem', { enumerable: false });
    setPropertyDescriptor(this, 'receiving', { enumerable: false });
    setPropertyDescriptor(this, 'recentOrder', { enumerable: false });
    setPropertyDescriptor(this, 'shipping', { enumerable: false });
    setPropertyDescriptor(this, 'sqs', { enumerable: false });

  }

  public isValid(strict: boolean = false): boolean {
    return isOrder(this, strict);
  }

  public hasChanged(field: string, compare?: (a: any, b: typeof a) => boolean): boolean {
    if (this.excludedFields.includes(field)) {
      return false;
    }

    compare = compare || ((a: any, b: typeof a) => a !== b);

    let current = resolveNestedPath(this, field);
    let initial = resolveNestedPath(this.initialData, field);

    return compare(current, initial);
  }

  public load(props: any): void {
    Object.assign(this, props);

    delete this.initialData;
    Object.defineProperty(this, 'initialData', {
      get: function () {
        return props;
      }
    });
  }

  public save(): void {
    Object.assign(this.initialData, this);
  }

  get orderTypeName(): OrderType {
    return orderTypes[this.orderType];
  }

  get inProgress(): boolean {
    return this.statusId === eOrderStatus.eInProgress;
  }

  get onHold(): boolean {
    return this.statusId === eOrderStatus.eOnHold;
  }

  get cancelled(): boolean {
    return this.statusId === eOrderStatus.eCancelled;
  }

  get closed(): boolean {
    return this.statusId === eOrderStatus.eClosed;
  }

  get replaced(): boolean {
    return this.statusId === eOrderStatus.eReplaced;
  }

  public resolveReadOnly() {
    this.readOnly = !this.accessible || !this.inProgress;
  }

  public toJSON() {
    return Object.assign({
      statusId: this.statusId
    }, this);
  }
}

//setPropertyDescriptor(Order.prototype, 'statusId', { enumerable: true });

function isOrder(x: any, strict: boolean = false): x is IOrder {
  const requiredKeys: KeyTypes<IOrder> = {
    id       : 'number',
    name     : 'string',
    number   : 'string',
    projectId: 'number',
    statusId : 'number',
    orderType  : 'string'
  };
  return verifyKeyTypes(x, requiredKeys, strict);
}

declare namespace Order {

  interface IOrder {
    id: number;
    projectId: number;
    number: string;
    name: string;
    statusId: number;

    orderType: keyof OrderTypes;

    createdBy?: number;
    createdDate?: string;
    modifiedBy?: number;
    modifiedDate?: string;

    // TODO: move these to mixin
    parentRevisionId?: number;
    revisionNumber?: number;
    revisionDate?: string;
  }
}
