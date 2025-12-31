import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeForm } from './node-form';

describe('NodeForm', () => {
  let component: NodeForm;
  let fixture: ComponentFixture<NodeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
