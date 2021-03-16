import { Component, OnDestroy, OnInit }          from '@angular/core';
import { ActivatedRoute }                        from "@angular/router";
import { EditorStateService }                    from "@app/shared/services/editor-state.service";
import { CanComponentDeactivate, ScreenService } from "@app/shared/services";
import { OrderService }                          from "@orders/services/order.service";
import { Orders }                                from "@orders/shared/orders";
import { from, Observable, Subject }             from "rxjs";
import { takeUntil }                             from "rxjs/operators";
import OrderType = Orders.OrderType;

@Component({
  selector: 'order-details-entry',
  templateUrl: './order-details-entry.component.html',
  styleUrls: ['./order-details-entry.component.scss']
})
export class OrderDetailsEntryComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  orderType: OrderType;
  orderId: number;

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private _service: OrderService,
    private route: ActivatedRoute,
    private editorState: EditorStateService,
    public screenService: ScreenService) {
  }

  confirm(): Observable<boolean> {
    return from(this.editorState.confirmPopup());
  }

  ngOnInit() {
    this._service.watchRouteParams(this.route)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((params) => {
          this.orderType = params.orderType;
          this.orderId   = params.orderId;
        });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
