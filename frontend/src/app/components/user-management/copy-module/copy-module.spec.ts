import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyModule } from './copy-module';

describe('CopyModule', () => {
  let component: CopyModule;
  let fixture: ComponentFixture<CopyModule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopyModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopyModule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
