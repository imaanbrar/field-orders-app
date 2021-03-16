import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderListEntryComponent } from './order-list-entry.component';

describe('OrderListEntryComponent', () => {
  let component: OrderListEntryComponent;
  let fixture: ComponentFixture<OrderListEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderListEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderListEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
