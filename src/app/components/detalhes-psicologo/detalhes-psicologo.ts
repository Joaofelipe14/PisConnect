import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-detalhes-psicologo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalhes-psicologo.html',
  styleUrls: ['./detalhes-psicologo.css'],
})
export class DetalhesPsicologoComponent implements OnInit {
  psicologo: any = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        return from(this.supabaseService.buscarPsicologoPorId(id));
      })
    ).subscribe({
      next: (psicologo) => {
        this.psicologo = psicologo;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
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
    this.router.navigate(['/lista-psicologos']);
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
}

