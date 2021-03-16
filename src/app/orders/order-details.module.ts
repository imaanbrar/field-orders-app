import { CommonModule }                         from '@angular/common';
import { NgModule }                             from '@angular/core';
import { FieldOrderDetailsControllerComponent } from '@orders/components/details/field/field-order-details-controller.component';
import { FieldOrderDetailsMainComponent }       from "@orders/components/details/field/main/field-order-details-main.component";
import { FieldOrderDetailsNotesComponent }      from "@orders/components/details/field/notes/field-order-details-notes.component";
import { FieldOrderDetailsSosComponent }        from "@orders/components/details/field/scope-of-supply/field-order-details-sos.component";
import { FieldOrderDetailsSummaryComponent }    from "@orders/components/details/field/summary/field-order-details-summary.component";
import { OrderDetailsEntryComponent }           from "@orders/components/details/order-details-entry.component";
import { RecentOrdersModule }                   from "@orders/recent-orders.module";
import { DevExtremeModule }                     from "devextreme-angular";
import { OrderDetailsRoutingModule }            from "./order-details-routing.module";

@NgModule({
  entryComponents: [
    OrderDetailsEntryComponent,
  ],
  declarations   : [
    OrderDetailsEntryComponent,

    FieldOrderDetailsControllerComponent,

    FieldOrderDetailsSummaryComponent,
    FieldOrderDetailsMainComponent,
    FieldOrderDetailsNotesComponent,
    FieldOrderDetailsSosComponent,
  ],
    imports: [
        CommonModule,
        OrderDetailsRoutingModule,
        RecentOrdersModule,
        DevExtremeModule
    ],
  exports        : [
    OrderDetailsEntryComponent,
  ],
})
export class OrderDetailsModule {}
