import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldOrderDetailsControllerComponent } from './field-order-details-controller.component';

describe('FieldOrderDetailsControllerComponent', () => {
  let component: FieldOrderDetailsControllerComponent;
  let fixture: ComponentFixture<FieldOrderDetailsControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldOrderDetailsControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldOrderDetailsControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
