import { CommonModule }          from '@angular/common';
import { NgModule }              from '@angular/core';
import { DevExtremeModule }      from "devextreme-angular";
import { RecentOrdersComponent } from './components/recent/recent-orders.component';

@NgModule({
  declarations: [
    RecentOrdersComponent
  ],
  imports     : [
    CommonModule,
    DevExtremeModule
  ],
  exports: [
    RecentOrdersComponent
  ]
})
export class RecentOrdersModule {}
