import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldOrderListComponent } from './field-order-list.component';

describe('FieldOrderListComponent', () => {
  let component: FieldOrderListComponent;
  let fixture: ComponentFixture<FieldOrderListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldOrderListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
