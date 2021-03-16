import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldOrderDetailsSosComponent } from './field-order-details-sos.component';

describe('FieldOrderDetailsSosComponent', () => {
  let component: FieldOrderDetailsSosComponent;
  let fixture: ComponentFixture<FieldOrderDetailsSosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldOrderDetailsSosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldOrderDetailsSosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
