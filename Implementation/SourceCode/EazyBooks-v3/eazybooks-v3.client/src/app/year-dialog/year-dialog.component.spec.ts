import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearDialogComponent } from './year-dialog.component';

describe('YearDialogComponent', () => {
  let component: YearDialogComponent;
  let fixture: ComponentFixture<YearDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [YearDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(YearDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
