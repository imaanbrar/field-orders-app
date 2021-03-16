import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldOrderDetailsNotesComponent } from './field-order-details-notes.component';

describe('FieldOrderDetailsNotesComponent', () => {
  let component: FieldOrderDetailsNotesComponent;
  let fixture: ComponentFixture<FieldOrderDetailsNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldOrderDetailsNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldOrderDetailsNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
