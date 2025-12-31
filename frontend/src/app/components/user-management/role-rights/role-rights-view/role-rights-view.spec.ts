import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleRightsView } from './role-rights-view';

describe('RoleRightsView', () => {
  let component: RoleRightsView;
  let fixture: ComponentFixture<RoleRightsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleRightsView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleRightsView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
