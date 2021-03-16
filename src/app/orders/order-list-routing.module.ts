import { NgModule }                from '@angular/core';
import { RouterModule, Routes }    from '@angular/router';
import { OrderListEntryComponent } from "@orders/components/list/order-list-entry.component";

const routes: Routes = [
  {
    path       : ':orderType',
    component  : OrderListEntryComponent
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class OrderListRoutingModule {}
