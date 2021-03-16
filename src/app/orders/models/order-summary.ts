import { eOrderStatus }                                  from "@app/shared/enums/eOrderStatus";
import { KeyTypes, verifyKeyTypes }                    from "@app/shared/utils/verifyKeyTypes";
import { OnChange }                                    from "property-watch-decorator";
import IOrderSummary = OrderSummary.IOrderSummary;
import { statusColor } from "../shared/orders";

export {
  OrderSummary,
  isOrderSummary,
}

class OrderSummary implements IOrderSummary {
  public id: number;
  public name: string;
  public number: string;
  public projectId: number;

  @OnChange('resolveReadOnly')
  public statusId: number;
  public status: string;

  public readOnly: boolean = false;

  @OnChange('resolveReadOnly')
  public accessible: boolean = false;

  constructor(props: any) {
    
    this.load(props);
  }

  isValid(strict: boolean = false): this is IOrderSummary {
    return isOrderSummary(this, strict);
  }

  public load(props: any): void {
    Object.assign(this, props);
  }

  get canBeOpened(): boolean {
    return this.accessible && (this.onHold || this.closed);
  }

  get canBeDeleted(): boolean {
    return this.accessible && !(this.onHold || this.closed || this.cancelled || this.replaced);
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

  get statusColor(): string {
    return statusColor(this.statusId);
  }

  public resolveReadOnly() {
    this.readOnly = false;
  }
}

function isOrderSummary(x: any, strict: boolean = false): x is IOrderSummary {
  const requiredKeys: KeyTypes<IOrderSummary> = {
    id       : 'number',
    projectId: 'number',
    number   : 'string',
    name     : 'string',
    statusId : 'number',
    status   : 'string',
  };
  return verifyKeyTypes(x, requiredKeys, strict);
}

declare namespace OrderSummary {

  interface IOrderSummary {
    id: number,
    projectId: number,
    number: string,
    name: string,
    statusId: number,
    status: string,
  }
}
