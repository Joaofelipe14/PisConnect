import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { SupabaseService } from '../../../services/supabase';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-psicologos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './psicologos.html',
  styleUrls: ['./psicologos.css']
})
export class AdminPsicologos implements OnInit {
  psicologos: any[] = [];
  loading = false;
  filtroAtivo: 'todos' | 'ativo' | 'inativo' = 'todos';

  // Propriedade para controlar modal
  psicologoSelecionado: any = null;

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.loadPsicologos();
  }


  truncate(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  async loadPsicologos() {
    this.loading = true;

    try {
      let filtro;
      if (this.filtroAtivo === 'ativo') filtro = true;
      else if (this.filtroAtivo === 'inativo') filtro = false;
      else filtro = undefined;

      this.ngZone.runOutsideAngular(async () => {
        const psicologos = await this.supabaseService.buscarPsicologosAdmin(filtro);

        // Transformar campos JSON em arrays
        psicologos.forEach(p => {
          try {
            if (typeof p.abordagem_terapeutica === 'string') {
              p.abordagem_terapeutica = JSON.parse(p.abordagem_terapeutica);
            }
          } catch { p.abordagem_terapeutica = []; }

          try {
            if (typeof p.publico_alvo === 'string') {
              p.publico_alvo = JSON.parse(p.publico_alvo);
            }
          } catch { p.publico_alvo = []; }
        });

        this.ngZone.run(() => {
          this.psicologos = psicologos;
          this.loading = false;
          this.cdr.markForCheck();
        });
      });
    } catch (error) {
      console.error('Erro ao buscar psicólogos:', error);
      this.ngZone.run(() => {
        this.loading = false;
        this.cdr.markForCheck();
      });
    }
  }


  // Alterna status ativo/inativo
  async toggleAtivo(psicologo: any) {
    try {
      // Converte boolean em 0/1 para evitar erro smallint no Supabase
      const novoStatus = psicologo.ativo ? 0 : 1;

      await this.supabaseService.toggleAtivoPsicologo(psicologo.id, novoStatus);

      this.ngZone.run(() => {
        psicologo.ativo = novoStatus;
        this.cdr.markForCheck();
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }

  onFiltroChange(novoFiltro: 'todos' | 'ativo' | 'inativo') {
    this.filtroAtivo = novoFiltro;
    this.loadPsicologos();
  }

  // -----------------------------
  // Modal
  // -----------------------------
  abrirModal(psicologo: any) {
    this.psicologoSelecionado = psicologo;
  }

  fecharModal() {
    this.psicologoSelecionado = null;
  }

  // Retorna inicial caso não tenha foto
  getInicial(nome: string) {
    return nome ? nome.charAt(0).toUpperCase() : '?';
  }

  confirmTogglePsicologo: { psicologo: any; novoStatus: boolean; notificar: boolean } | null = null;

// Ao clicar no botão Ativar/Desativar
abrirConfirmToggle(psicologo: any) {
  this.confirmTogglePsicologo = {
    psicologo,
    novoStatus: !psicologo.ativo,
    notificar: true // default não notificar
  };
}

// Fechar modal
fecharConfirmToggle() {
  this.confirmTogglePsicologo = null;
}

// Confirmar alteração
async confirmarToggle() {
  if (!this.confirmTogglePsicologo) return;

  const { psicologo, novoStatus, notificar } = this.confirmTogglePsicologo;

  try {
    await this.supabaseService.toggleAtivoPsicologo(psicologo.id, novoStatus);

    // Atualiza visual local
    this.ngZone.run(() => {
      psicologo.ativo = novoStatus;
      this.cdr.markForCheck();
    });

    // Se optou por notificar, envia notificação (simulado)
    if (notificar) {
      this.notificarCliente(psicologo, novoStatus);
    }

  } catch (error) {
    console.error('Erro ao alterar status:', error);
  }

  this.fecharConfirmToggle();
}

// Função de notificação (simulação)
notificarCliente(psicologo: any, ativo: boolean) {
  const mensagem = `Olá ${psicologo.nome}, seu status foi alterado para ${ativo ? 'Ativo' : 'Inativo'}.`;
  console.log('Enviar notificação via WhatsApp/Email:', mensagem);
  // Aqui você chamaria sua API ou serviço de envio real
}

}
