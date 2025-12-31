import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleRights } from './role-rights';

describe('RoleRights', () => {
  let component: RoleRights;
  let fixture: ComponentFixture<RoleRights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleRights]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleRights);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
