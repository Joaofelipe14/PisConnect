import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { from, Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
@Component({
  selector: 'app-lista-psicologos',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './lista-psicologos.html',
  styleUrls: ['./lista-psicologos.css'],
})
export class ListaPsicologos implements OnInit {
  psicologos$!: Observable<any[]>;
  psicologosFiltrados$!: Observable<any[]>;
  searchTerm = '';
  viewMode: 'card' | 'list' = 'card';
  faWhatsapp = faWhatsapp;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Recuperar preferência do localStorage apenas no browser
    if (isPlatformBrowser(this.platformId)) {
      const savedViewMode = localStorage.getItem('psicologos-view-mode');
      if (savedViewMode === 'card' || savedViewMode === 'list') {
        this.viewMode = savedViewMode;
      }
    }
  }

  ngOnInit() {
    this.psicologos$ = from(this.supabaseService.buscarPsicologos());

    this.psicologosFiltrados$ = this.psicologos$.pipe(
      map(psicologos => {
        const term = this.searchTerm.toLowerCase();
        if (!term) return psicologos;
        return psicologos.filter(p => {
          const abordagens = this.parseJson(p.abordagem_terapeutica);
          const publicos = this.parseJson(p.publico_alvo);
          return (
            p.nome?.toLowerCase().includes(term) ||
            abordagens.some((a: string) => a.toLowerCase().includes(term)) ||
            p.areas_atuacao?.some((area: string) => area.toLowerCase().includes(term)) ||
            p.formacao?.toLowerCase().includes(term) ||
            publicos.some((pub: string) => pub.toLowerCase().includes(term))
          );
        });
      })
    );
  }

  onSearchChange() {
    this.psicologosFiltrados$ = this.psicologos$.pipe(
      map(psicologos => {
        const term = this.searchTerm.toLowerCase();
        if (!term) return psicologos;
        return psicologos.filter(p => {
          const abordagens = this.parseJson(p.abordagem_terapeutica);
          const publicos = this.parseJson(p.publico_alvo);
          return (
            p.nome?.toLowerCase().includes(term) ||
            abordagens.some((a: string) => a.toLowerCase().includes(term)) ||
            p.areas_atuacao?.some((area: string) => area.toLowerCase().includes(term)) ||
            p.formacao?.toLowerCase().includes(term) ||
            publicos.some((pub: string) => pub.toLowerCase().includes(term))
          );
        });
      })
    );
  }

  verDetalhes(id: string) {
    this.router.navigate(['/psicologo', id]);
  }

  abrirWhatsApp(whatsapp: string) {
    if (whatsapp) {
      const url = whatsapp.startsWith('http') ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, '')}`;
      window.open(url, '_blank');
    }
  }

  parseJson(value: any): any {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
      } catch {
        // Se não for JSON válido, trata como string simples
        return value ? [value] : [];
      }
    }
    // Se já for array, retorna direto
    if (Array.isArray(value)) {
      return value;
    }
    // Se não for string nem array, retorna array vazio
    return [];
  }

  getPrimeiraArea(areas: string[]): string {
    return areas && areas.length > 0 ? areas[0] : 'Psicologia';
  }

  getPrimeiraAbordagem(psicologo: any): string {
    const abordagens = this.parseJson(psicologo?.abordagem_terapeutica);
    if (abordagens.length > 0) {
      return abordagens[0];
    }
    return this.getPrimeiraArea(psicologo?.areas_atuacao);
  }

  getPublicoAlvo(psicologo: any): string {
    const publicos = this.parseJson(psicologo?.publico_alvo);
    if (publicos.length > 0) {
      return publicos.join(', ');
    }
    return '';
  }

  getAbordagensArray(psicologo: any): string[] {
    return this.parseJson(psicologo?.abordagem_terapeutica);
  }

  getPublicoAlvoArray(psicologo: any): string[] {
    return this.parseJson(psicologo?.publico_alvo);
  }

  getResumoTruncado(psicologo: any, limite: number = 120): string {
    const resumo = psicologo?.resumo || '';
    if (!resumo || resumo.length <= limite) {
      return resumo;
    }
    // Encontra o último espaço antes do limite para não cortar palavras
    const truncado = resumo.substring(0, limite);
    const ultimoEspaco = truncado.lastIndexOf(' ');
    return ultimoEspaco > 0 ? truncado.substring(0, ultimoEspaco) + '...' : truncado + '...';
  }

  getAvatarUrl(psicologo: any): string {
    if (psicologo?.foto_url) {
      return psicologo.foto_url;
    }
    const nome = psicologo?.nome || 'Psicólogo';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=14b8a6&color=fff&size=128`;
  }

  setViewMode(mode: 'card' | 'list') {
    this.viewMode = mode;
    // Salvar preferência apenas no browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('psicologos-view-mode', mode);
    }
  }
}
