import { Component, Input, OnInit } from '@angular/core';
import { FieldOrderSummary }        from "@orders/models/field/field-order-summary";

@Component({
  selector: 'field-order-details-summary',
  templateUrl: './field-order-details-summary.component.html',
  styleUrls: ['./field-order-details-summary.component.scss']
})
export class FieldOrderDetailsSummaryComponent implements OnInit {

  @Input() orderSummary: FieldOrderSummary;

  constructor() {

  }

  ngOnInit() {

  }

}
