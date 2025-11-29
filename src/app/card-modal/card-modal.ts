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
  loading: boolean = false;

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

    // Formatação automática do número do cartão
    this.cardForm.get('cardNumber')?.valueChanges.subscribe(value => {
      if (value) {
        // Remove caracteres não numéricos
        const numeric = value.replace(/\D/g, '');
        // Formata com espaços a cada 4 dígitos
        const formatted = this.formatCardNumber(numeric);
        if (formatted !== value) {
          this.cardForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
        }
      }
    });

    // Formatação automática do mês (adiciona zero à esquerda apenas quando necessário)
    this.cardForm.get('expMonth')?.valueChanges.subscribe(value => {
      if (value) {
        // Remove caracteres não numéricos
        const numeric = value.replace(/\D/g, '');
        
        // Limita a 2 dígitos
        const limited = numeric.substring(0, 2);
        
        // Valida se está entre 1 e 12
        const monthNum = parseInt(limited);
        if (limited.length === 2 && (monthNum < 1 || monthNum > 12)) {
          // Se for inválido, mantém apenas o primeiro dígito
          const firstDigit = limited.substring(0, 1);
          this.cardForm.get('expMonth')?.setValue(firstDigit, { emitEvent: false });
          return;
        }
        
        // Atualiza o valor se necessário
        if (limited !== value) {
          this.cardForm.get('expMonth')?.setValue(limited, { emitEvent: false });
        }
      }
    });

    // Limita o CVV a apenas números
    this.cardForm.get('cvv')?.valueChanges.subscribe(value => {
      if (value && !/^\d*$/.test(value)) {
        const numeric = value.replace(/\D/g, '');
        this.cardForm.get('cvv')?.setValue(numeric, { emitEvent: false });
      }
    });

    // Limita o ano a apenas números
    this.cardForm.get('expYear')?.valueChanges.subscribe(value => {
      if (value && !/^\d*$/.test(value)) {
        const numeric = value.replace(/\D/g, '');
        this.cardForm.get('expYear')?.setValue(numeric, { emitEvent: false });
      }
    });

    // cartão polaris teste
    this.cardForm.setValue({
      cardNumber: '5162 9272 3371 8417',
      cardHolder: 'Joao F M luz',
      expMonth: '09',
      expYear: '2033', // Mudei para string
      cvv: '123'
    });
  }

  formatCardNumber(value: string): string {
    // Remove todos os espaços e caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    // Adiciona espaços a cada 4 dígitos
    return numbers.replace(/(.{4})/g, '$1 ').trim();
  }

  formatCardNumberInput(event: any) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    if (value.length > 19) {
      value = value.substring(0, 19);
    }
    this.cardForm.get('cardNumber')?.setValue(value, { emitEvent: false });
  }

  formatCardHolder(event: any) {
    const input = event.target;
    let value = input.value.toUpperCase();
    this.cardForm.get('cardHolder')?.setValue(value, { emitEvent: false });
  }

  formatMonthOnBlur() {
    const monthValue = this.cardForm.get('expMonth')?.value;
    if (monthValue && monthValue.length === 1) {
      const monthNum = parseInt(monthValue);
      if (monthNum >= 1 && monthNum <= 9) {
        // Adiciona zero à esquerda apenas quando o campo perde o foco e tem 1 dígito válido
        this.cardForm.get('expMonth')?.setValue(monthValue.padStart(2, '0'), { emitEvent: false });
      }
    }
  }

  async submit() {
    if (this.loading) return;

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

    this.loading = true;
    this.erroMsg = null;

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
            this.loading = false;
            this.dialogRef.close(payload);
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            console.error('Erro na assinatura:', err);
            this.erroMsg = err?.error?.message || 'Erro ao processar assinatura';
            this.loading = false;
            this.cdr.markForCheck();
          });
        }
      });

    } catch (err) {
      console.error('Erro ao gerar token do cartão:', err);
      this.loading = false;
      this.erroMsg = 'Erro ao processar cartão: ' + ((err as any)?.message || 'Erro desconhecido');
      this.cdr.markForCheck();
    }
  }

  close() {
    this.dialogRef.close();
  }
}