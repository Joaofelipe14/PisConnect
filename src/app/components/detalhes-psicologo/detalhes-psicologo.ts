import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-detalhes-psicologo',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './detalhes-psicologo.html',
  styleUrls: ['./detalhes-psicologo.css'],
})
export class DetalhesPsicologoComponent implements OnInit {
  psicologo: any = null;
  loading = true;
  error = false;
  faWhatsapp = faWhatsapp; // ⚠️ deve ser propriedade da classe
  shareSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    window.scroll(0,0)
    this.loading = true;
    this.cdr.detectChanges();

    this.route.params.subscribe(params => {
      const id = params['id'];

      this.supabaseService.buscarPsicologoPorId(id)
        .then(psicologo => {
          this.ngZone.run(() => {
            this.psicologo = psicologo || null;
            this.loading = false;
            if (!psicologo) this.error = true;
            this.cdr.detectChanges();
          });
        })
        .catch(err => {
          this.ngZone.run(() => {
            console.error('Erro ao buscar psicólogo:', err);
            this.error = true;
            this.loading = false;
            this.cdr.detectChanges();
          });
        });
    });
  }

  abrirWhatsApp() {
    if (this.psicologo?.whatsapp) {
      const whatsapp = this.psicologo.whatsapp;
      const url = whatsapp.startsWith('http')
        ? whatsapp
        : `https://wa.me/${whatsapp.replace(/\D/g, '')}`;
      window.open(url, '_blank');
    }
  }

  voltar() {
    this.router.navigate(['/psicologos']);
  }

  getAbordagem(): string {
    return this.psicologo?.abordagem_terapeutica ||
      (this.psicologo?.areas_atuacao && this.psicologo.areas_atuacao.length > 0
        ? this.psicologo.areas_atuacao[0]
        : 'Psicologia');
  }

  getAvatarUrl(): string {
    if (this.psicologo?.foto_url) {
      return this.psicologo.foto_url;
    }
    const nome = this.psicologo?.nome || 'Psicólogo';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=14b8a6&color=fff&size=200`;
  }

  compartilharPerfil() {
    const url = window.location.href;
    const nome = this.psicologo?.nome || 'Psicólogo';
    const texto = `Conheça ${nome} no SociPsi - ${this.getAbordagem()}`;

    // Tenta usar a Web Share API se disponível (mobile)
    if (navigator.share) {
      navigator.share({
        title: `${nome} - SociPsi`,
        text: texto,
        url: url
      }).catch(() => {
        // Se o usuário cancelar, não faz nada
      });
    } else {
      // Fallback: copia o link para a área de transferência
      navigator.clipboard.writeText(url).then(() => {
        this.shareSuccess = true;
        setTimeout(() => {
          this.shareSuccess = false;
        }, 2000);
      }).catch(() => {
        // Fallback adicional: mostra o link em um prompt
        prompt('Copie o link:', url);
      });
    }
  }
}
