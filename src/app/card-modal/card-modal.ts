// card-modal.component.ts
import { ChangeDetectorRef, Component, Inject, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { validateCardNumber, validateExp, validateCvv } from '../../card-utils'
import { ordem } from '../services/ordem';
declare var MercadoPago: any;

@Component({
  selector: 'app-card-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './card-modal.html',
  styleUrls: ['./card-modal.css']

})
export class CardModalComponent {
  cardForm: FormGroup;
  mp: any;
  erroMsg: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CardModalComponent>,
    private ordem: ordem,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public plano: any // <-- aqui

  ) {
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(13)]],
      cardHolder: ['', Validators.required],
      expMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      expYear: ['', [Validators.required, Validators.min(new Date().getFullYear())]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
    });

    // Inicializa o Mercado Pago
    this.mp = new MercadoPago('APP_USR-1e3e9f76-d85e-4269-9b5e-7fd7e34cf1b5', { locale: 'pt-BR' });
    // cartão polaris teste
    this.cardForm.setValue({
      cardNumber: '5162927233718417',
      cardHolder: 'Joao F M luz',
      expMonth: '09',
      expYear: '2033', // Mudei para string
      cvv: ''
    });
  }

  async submit() {
    if (!validateCardNumber(this.cardForm.value.cardNumber)) {
      alert('Número do cartão inválido');
      return;
    }
    if (!validateExp(this.cardForm.value.expMonth, this.cardForm.value.expYear)) {
      alert('Data de validade inválida');
      return;
    }
    if (!validateCvv(this.cardForm.value.cvv)) {
      alert('CVV inválido');
      return;
    }

    try {
      // ⚠️ ATENÇÃO: Use os nomes corretos que o SDK JavaScript espera!
      const cardData = {
        cardNumber: this.cardForm.value.cardNumber.replace(/\s/g, ''),
        cardholderName: this.cardForm.value.cardHolder,
        cardExpirationMonth: this.cardForm.value.expMonth.toString().padStart(2, '0'),
        cardExpirationYear: this.cardForm.value.expYear.toString(),
        securityCode: this.cardForm.value.cvv,

      };
      const tokenResponse = await this.mp.createCardToken(cardData);

      if (!tokenResponse.id) {
        alert('Erro ao gerar token do cartão');
        return;
      }
      const payload = {
        card_token_id: tokenResponse.id,
        preapproval_plan_id: this.plano.preapproval_plan_id
      };

      this.ordem.gerarOrdemAssinatura(payload).subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            console.log('Sucesso:', res);
            this.dialogRef.close(payload);
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.erroMsg = err?.error?.message || 'Erro ao processar assinatura';
            this.cdr.markForCheck();
          });
        }
      });

    } catch (err) {
      console.error('Erro ao gerar token do cartão:', err);
      alert('Erro ao processar cartão: ' + (err as any)?.message || 'Erro desconhecido');
    }
  }

  close() {
    this.dialogRef.close();
  }
}