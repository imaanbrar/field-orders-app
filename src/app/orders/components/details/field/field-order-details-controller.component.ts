import { Component, EventEmitter, HostBinding, OnDestroy, OnInit, Output } from '@angular/core';
import { LoggedInUser }                                                    from "@app/shared/models/LoggedInUser";
import { EditorStateService }                                              from "@app/shared/services/editor-state.service";
import { UserService }                                                     from "@app/shared/services/user.service";
import { ScreenService }                                                   from "@app/shared/services";
import { FieldOrder }                                                      from "@orders/models/field/field-order";
import { FieldOrderSummary }                                               from "@orders/models/field/field-order-summary";
import { OrderService }                                                    from "@orders/services/order.service";
import { Orders }                                                          from "@orders/shared/orders";
import { confirm }                                                         from "devextreme/ui/dialog";
import { forkJoin, Subject }                                               from "rxjs";
import { shareReplay, takeUntil }                                          from "rxjs/operators";
import OrderType = Orders.OrderType;

@Component({
  selector   : 'field-order-details-controller',
  templateUrl: './field-order-details-controller.component.html',
  styleUrls  : [ './field-order-details-controller.component.scss' ]
})
export class FieldOrderDetailsControllerComponent implements OnInit, OnDestroy {

  @HostBinding('id') id = 'order-details-controller';

  @Output() orderSummary: FieldOrderSummary = new FieldOrderSummary({});
  @Output() order: FieldOrder               = new FieldOrder({});

  @Output() revisionChangeResult = new EventEmitter<any>();
  @Output() revisionCreated      = new EventEmitter<never>();
  @Output() setOrderOpen         = new EventEmitter<never>();
  @Output() setOrderDeleted      = new EventEmitter<never>();

  loggedInUser: LoggedInUser;

  orderType: OrderType;
  orderId: number;

  private deleteConfirmation = `
<i>Are you sure you want to delete the Order?</i><br/><br/>
<div class="alert alert-warning">
    <strong>Warning!</strong>
    <i>  Deleting the Order will change the Status to Cancelled which cannot be reverted back</i>
</div>`;

  private destroyed: Subject<void> = new Subject();

  popups = {
    info: false,
    report: false,
  };

  tabs: any[] = [
    {
      title: "Main",
      icon : "box"
    },
    {
      title: "Items",
      icon : "money"
    },
    {
      title: "Notes",
      icon : "comment"
    }
  ];

  newRevIndicatorVisible: boolean = false;

  reportUrl = "FieldOrderDoc";

  constructor(
    private _service: OrderService,
    private editorState: EditorStateService,
    public screen: ScreenService) {

    this.loggedInUser = UserService.loggedInUser;

    screen.hideFooterOnMobile(this.destroyed);
  }

  orderFactory(data: any): FieldOrder {
    return new FieldOrder(data);
  }

  summaryFactory(data: any): FieldOrderSummary {
    return new FieldOrderSummary(data);
  }

  onClickShowInfo() {
    this.popups.info = true;
  }

  onClickBackToList() {
    this._service.openOrderList();
  }

  onClickDeleteOrder() {
    this.editorState.confirmPopup().then(confirmed => {
      if (confirmed) {
        confirm(this.deleteConfirmation, 'Confirm changes').then(confirmed => {
          if (confirmed) {
            this.setOrderDeleted.emit();
          }
        });
      }
    });
  }

  onClickOpenOrder() {
    this.setOrderOpen.emit();
  }

  onRevisionChanged(e) {
    const revisionId = Number(e.value);
    this.editorState.confirmPopup().then(confirmed => {
      const cancelled = !confirmed;
      if (confirmed) {
        this.editorState.setDisabled(() => confirmed);
        this._service.orderId = revisionId;
      }
      this.revisionChangeResult.emit({ cancelled, e });
    });
  }

  onSaved(success: boolean) {
    if (success) {
      this.reloadOrder();
    }
  }

  updateRecentOrders() {
    this._service.updateRecentOrder(this.orderSummary.id).subscribe();
  }

  loadOrder(): Promise<void> {
    return forkJoin([
      this._service.getOrderById(this.orderId),
      this._service.getOrderSummaryById(this.orderId),
    ]).toPromise().then((data: [ any, any ]) => {
      const [ order, summary ] = data;

      this.order        = this.orderFactory(order);
      this.orderSummary = this.summaryFactory(summary);

      this.updateRecentOrders();

      this.editorState.setDisabled(() => this.orderSummary.readOnly);
    })
  }

  reloadOrder() {
    forkJoin([
      this._service.getOrderById(this.orderId),
      this._service.getOrderSummaryById(this.orderId),
    ]).subscribe((data: [ any, any ]) => {
      const [ order, summary ] = data;

      this.order.load(order);
      this.orderSummary.load(summary);
    });
  }

  generateDoc() {
    this.popups.report = true;
  }

  onReportParametersSubmitted(event) {
    event.args.Parameters.filter(function (p) { return p.Key == "pReqId"; })[0].Value = this.order.id;
  }

  ngOnInit() {
    this._service.orderParameters$
        .pipe(takeUntil(this.destroyed))
        .subscribe((params) => {
          this.orderType = params.orderType;
          this.orderId   = params.orderId;

          this.loadOrder().then();

          this.editorState.setClean();
        });
  }

  ngOnDestroy(): void {
    this.revisionChangeResult.complete();
    this.revisionCreated.complete();
    this.setOrderOpen.complete();
    this.setOrderDeleted.complete();

    this.destroyed.next();
    this.destroyed.complete();
  }

}
