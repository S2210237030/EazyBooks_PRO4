import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDialogComponent } from './transaction-dialog.component';

describe('TransactionsComponent', () => {
  let component: TransactionDialogComponent;
  let fixture: ComponentFixture<TransactionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
