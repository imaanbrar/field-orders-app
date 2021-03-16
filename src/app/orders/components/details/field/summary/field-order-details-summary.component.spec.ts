import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldOrderDetailsSummaryComponent } from './field-order-details-summary.component';

describe('FieldOrderDetailsSummaryComponent', () => {
  let component: FieldOrderDetailsSummaryComponent;
  let fixture: ComponentFixture<FieldOrderDetailsSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldOrderDetailsSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldOrderDetailsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
