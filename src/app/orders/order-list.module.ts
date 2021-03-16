import { OrderDetailsModule } from './order-details.module';
import { CommonModule }            from '@angular/common';
import { NgModule }                from '@angular/core';
import { FieldOrderListComponent } from "@orders/components/list/field/field-order-list.component";
import { OrderListEntryComponent } from "@orders/components/list/order-list-entry.component";
import { RecentOrdersModule }      from "@orders/recent-orders.module";
import { DevExtremeModule }        from "devextreme-angular";
import { OrderListRoutingModule }  from "./order-list-routing.module";

@NgModule({
  entryComponents: [
    OrderListEntryComponent,
  ],
  declarations   : [
    OrderListEntryComponent,

    FieldOrderListComponent,
  ],
  imports        : [
    CommonModule,
    OrderListRoutingModule,
    RecentOrdersModule,
    DevExtremeModule
  ],
  exports        : [
    OrderListEntryComponent
  ]
})
export class OrderListModule {}
