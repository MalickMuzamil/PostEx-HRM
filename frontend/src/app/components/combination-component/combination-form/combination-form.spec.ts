import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinationForm } from './combination-form';

describe('CombinationForm', () => {
  let component: CombinationForm;
  let fixture: ComponentFixture<CombinationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombinationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CombinationForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
