import { ChangeDetectorRef, Component, Inject, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ordem } from '../services/ordem';
import { Loading } from '../loading/loading';

@Component({
  selector: 'app-card-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    Loading
  ],
  templateUrl: './card-modal.html',
  styleUrls: ['./card-modal.css']
})
export class CardModalComponent {
  step = 1;
  loading = false;
  erroMsg: string | null = null;
  remoteIp: string | null = null;
  plano: any;
  user: any;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ordem: ordem,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private dialogRef: MatDialogRef<CardModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.plano = data?.plano || null;
    this.user = data?.user || null;

    this.form = this.fb.group({
      cardNumber: ['4111111111111111', Validators.required],
      cardHolder: ['JOAO FELIPE', Validators.required],
      expMonth: ['12', Validators.required],
      expYear: ['2029', Validators.required],
      cvv: ['123', Validators.required],
      postalCode: ['65000-000', Validators.required],
      addressNumber: ['123', Validators.required]
    });

    this.http.get('https://api.ipify.org?format=json')
      .subscribe((res: any) => {
        this.remoteIp = res.ip;
      });
  }

  goToStep(step: number) {
    this.step = step;
  }

  formatCardNumberInput(event: any) {
    let v = event.target.value.replace(/\D/g, '').substring(0, 16);
    v = v.replace(/(.{4})/g, '$1 ').trim();
    this.form.patchValue({ cardNumber: v }, { emitEvent: false });
  }

  formatCardHolder(event: any) {
    const v = event.target.value.toUpperCase();
    this.form.patchValue({ cardHolder: v }, { emitEvent: false });
  }

  formatMonthOnBlur() {
    const m = this.form.value.expMonth;
    if (m && m.length === 1) {
      this.form.patchValue({ expMonth: '0' + m }, { emitEvent: false });
    }
  }
  async submit() {
    if (this.loading) return;
    if (this.form.invalid) return;

    const values = this.form.value;

    const payload = {
      plano_id: this.plano.id,
      creditCard: {
        holderName: values.cardHolder,
        number: values.cardNumber.replace(/\s/g, ''),
        expiryMonth: values.expMonth.toString().padStart(2, '0'),
        expiryYear: values.expYear.toString(),
        ccv: values.cvv
      },
      creditCardHolderInfo: {
        name: this.user.nome,
        email: this.user.email,
        cpfCnpj: this.user.cpf.replace(/\D/g, ''),
        postalCode: values.postalCode.replace(/\D/g, ''),
        addressNumber: values.addressNumber,
        phone: this.user.whatsapp.replace(/\D/g, '')
      },
      remoteIp: this.remoteIp
    };
    const secret = 'minha-chave-secreta-qualquer';

    const encrypted = await this.encryptData(payload, secret);
    this.loading = true
    this.cdr.markForCheck();

    this.ordem.gerarOrdemAssinatura(encrypted).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.dialogRef.close(res);
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.erroMsg = err?.error?.message || 'Erro ao processar assinatura';
          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  private async getCryptoKey(secretKey: string) {
    const enc = new TextEncoder();
    const keyMaterial = enc.encode(secretKey);
    const hash = await crypto.subtle.digest('SHA-256', keyMaterial);

    return crypto.subtle.importKey(
      'raw',
      hash,
      'AES-GCM',
      false,
      ['encrypt', 'decrypt']
    );
  }
  async encryptData(data: any, secretKey: string) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.getCryptoKey(secretKey);
    const enc = new TextEncoder();
    const encoded = enc.encode(JSON.stringify(data));

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    return {
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)))
    };
  }



  close() {
    this.dialogRef.close();
  }
}
