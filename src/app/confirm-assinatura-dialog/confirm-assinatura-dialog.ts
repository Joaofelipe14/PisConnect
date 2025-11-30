import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-assinatura-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h1 mat-dialog-title>Confirmação de Assinatura</h1>
    <div mat-dialog-content>
      <p><strong>Plano:</strong> {{data.plano.nome}}</p>
      <p>{{data.plano.descricao}}</p>
      <p>Preço: R$ {{data.plano.preco_promocional}} | Duração: {{data.plano.duracao_dias}} dias</p>
      <p>Você será cobrado hoje e terá acesso ao plano pelos próximos {{data.plano.duracao_dias}} dias.</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-button color="primary" (click)="onConfirm()">Confirmar</button>
    </div>
  `
})
export class ConfirmAssinaturaDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmAssinaturaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
