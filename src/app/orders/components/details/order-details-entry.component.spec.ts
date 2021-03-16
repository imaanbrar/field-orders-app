import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetailsEntryComponent } from './order-details-entry.component';

describe('OrderDetailsEntryComponent', () => {
  let component: OrderDetailsEntryComponent;
  let fixture: ComponentFixture<OrderDetailsEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderDetailsEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailsEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
