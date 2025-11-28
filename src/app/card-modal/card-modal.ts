// card-modal.component.ts
import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { validateCardNumber, getCardBrand, validateExp, validateCvv } from '../../card-utils'
import { ordem } from '../services/ordem';
declare var MercadoPago: any; // SDK global do Mercado Pago

@Component({
  selector: 'app-card-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './card-modal.html',
})
export class CardModalComponent {
  cardForm: FormGroup;
  mp: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CardModalComponent>,
    private ordem: ordem,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
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
      expYear: '2033',
      cvv: '334'
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
      // Cria o token do cartão com Mercado Pago
      const cardData = {
        cardNumber: this.cardForm.value.cardNumber,
        cardholderName: this.cardForm.value.cardHolder,
        expirationMonth: this.cardForm.value.expMonth,
        expirationYear: this.cardForm.value.expYear,
        securityCode: this.cardForm.value.cvv
      };

      const tokenResponse = await this.mp.createCardToken(cardData);

      if (!tokenResponse.id) {
        alert('Erro ao gerar token do cartão');
        return;
      }

      const payload = {
        card_token_id: tokenResponse.id,
        plano_id: "326ecf9b-b009-418b-8c22-1f7ab8e80862"
      };

      console.log('fazendo requisição...', payload);

      this.ordem.gerarOrdemAssinatura(payload).subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            console.log(res);
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            console.log('Erro na assinatura:', err);
            this.cdr.markForCheck();
          });
        }
      });

      this.dialogRef.close(payload);
    } catch (err) {
      console.error('Erro ao gerar token do cartão:', err);
      alert('Erro ao processar cartão.');
    }
  }

  close() {
    this.dialogRef.close();
  }
}
