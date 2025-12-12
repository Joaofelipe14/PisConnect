import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { gerarSlug } from '../utils/slug';

@Component({
  selector: 'app-confirm-assinatura-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule],
  templateUrl: './confirm-assinatura-dialog.html',
  styleUrls: ['./confirm-assinatura-dialog.css']
})
export class ConfirmAssinaturaDialog {
  aceitoTermos = false;
  termosUrl = '/termos-privacidade?assinatura=1';

  constructor(
    public dialogRef: MatDialogRef<ConfirmAssinaturaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onConfirm() {
    if (!this.aceitoTermos) {
      alert('Por favor, concorde com a política de assinatura para continuar.');
      return;
    }
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  getPrimeiraCobranca(diasGratis: number): Date {
    const hoje = new Date();
    const primeiraCobranca = new Date(hoje);
    primeiraCobranca.setDate(hoje.getDate() + diasGratis);
    return primeiraCobranca;
  }


  verDetalhes(psicologo: any) {
    // Gera o slug a partir do nome e CRP do psicólogo
    const nome = psicologo?.nome || '';
    const crp = psicologo?.crp || '';
    const slug = gerarSlug(nome, crp);

    return slug
  }
  getPrecoPlano(plano: any): string {
    if (plano.promocao === 1 && plano.preco_promocional) {
      return plano.parcela_preco_promocional;
    }
    return plano.parcela_preco_normal;
  }
}
