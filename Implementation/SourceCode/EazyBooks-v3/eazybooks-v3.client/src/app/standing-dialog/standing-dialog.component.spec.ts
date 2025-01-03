import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandingDialogComponent } from './standing-dialog.component';

describe('StandingDialogComponent', () => {
  let component: StandingDialogComponent;
  let fixture: ComponentFixture<StandingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StandingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StandingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
