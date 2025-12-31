import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BindingForm } from './binding-form';

describe('BindingForm', () => {
  let component: BindingForm;
  let fixture: ComponentFixture<BindingForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BindingForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BindingForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
