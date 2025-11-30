import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAssinaturaDialog } from './confirm-assinatura-dialog';

describe('ConfirmAssinaturaDialog', () => {
  let component: ConfirmAssinaturaDialog;
  let fixture: ComponentFixture<ConfirmAssinaturaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmAssinaturaDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmAssinaturaDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
