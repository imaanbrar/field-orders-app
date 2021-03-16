import { Component, Input, OnInit } from '@angular/core';
import { ScreenService }            from "@app/shared/services";
import { ApiEndpointService } from '@app/shared/services/api-endpoint.service';
import { RecentOrder }              from "@orders/models/recent-order";
import { OrderService }             from "@orders/services/order.service";
import { Orders, statusColor }      from "@orders/shared/orders";
import * as AspNetData              from "devextreme-aspnet-data-nojquery";
import DataSource                   from "devextreme/data/data_source";
import OrderType = Orders.OrderType;

@Component({
  selector: 'recent-orders',
  templateUrl: './recent-orders.component.html',
  styleUrls: ['./recent-orders.component.scss']
})
export class RecentOrdersComponent implements OnInit {

  @Input()
  type: OrderType;

  orders: DataSource;

  private endpoints: typeof ApiEndpointService;

  constructor(private service: OrderService, public screen: ScreenService) {
    this.endpoints = ApiEndpointService;
  }

  itemClicked(e) {
    const order: RecentOrder = e.itemData;

    this.service.order = order;
  }

  statusColor(item: any): string {
    return statusColor(item.statusId);
  }

  protected createStores() {
    this.orders = new DataSource({
      paginate: false,
      store: AspNetData.createStore({
        key: "orderId",
        loadUrl: this.endpoints.api.RecentOrders.GetRecentOrders(),
        loadParams: { type: this.type }
      }),
      map: (item) => {
        return new RecentOrder(item);
      },
    });
  }

  ngOnInit() {
    this.createStores();
  }
}
