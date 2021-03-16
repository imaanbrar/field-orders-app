import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute }               from "@angular/router";
import { OrderService }                 from "@orders/services/order.service";
import { Orders }                       from "@orders/shared/orders";
import { Subject }                      from "rxjs";
import { takeUntil }                    from "rxjs/operators";
import OrderType = Orders.OrderType;

@Component({
  selector: 'order-list-entry',
  templateUrl: './order-list-entry.component.html',
  styleUrls: ['./order-list-entry.component.scss']
})
export class OrderListEntryComponent implements OnInit, OnDestroy {

  tabs: string[] = [ "Recent", "All" ];

  orderType: OrderType;

  private unsubscribe: Subject<void> = new Subject();

  constructor(private _service: OrderService, private route: ActivatedRoute) {

  }

  get heading(): string {
    const headings = {
      field   : 'Field Orders'
    };
    return headings[this.orderType] || 'Orders';
  }

  ngOnInit() {

    this._service.watchRouteParams(this.route)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((params) => {
          this.orderType = params.orderType;
        });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
