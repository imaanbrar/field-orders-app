import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldOrderDetailsMainComponent } from './field-order-details-main.component';

describe('FieldOrderDetailsMainComponent', () => {
  let component: FieldOrderDetailsMainComponent;
  let fixture: ComponentFixture<FieldOrderDetailsMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldOrderDetailsMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldOrderDetailsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
