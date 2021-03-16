import { NgModule }                   from '@angular/core';
import { RouterModule, Routes }       from '@angular/router';
import { AuthGuardService }           from "@app/shared/services";
import { OrderDetailsEntryComponent } from "@orders/components/details/order-details-entry.component";

const routes: Routes = [
  {
    path         : ':orderType/:orderId',
    component    : OrderDetailsEntryComponent,
    canDeactivate: [ AuthGuardService ],
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class OrderDetailsRoutingModule {}
