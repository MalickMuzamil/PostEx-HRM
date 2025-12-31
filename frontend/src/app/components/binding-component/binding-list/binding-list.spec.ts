import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BindingList } from './binding-list';

describe('BindingList', () => {
  let component: BindingList;
  let fixture: ComponentFixture<BindingList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BindingList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BindingList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
