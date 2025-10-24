import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-lista-psicologos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-psicologos.html',
  styleUrls: ['./lista-psicologos.css'],
})
export class ListaPsicologos implements OnInit {
  psicologos: any[] = [];
  loading = true;
  error = '';

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.carregarPsicologos();
  }

  async carregarPsicologos() {
    this.loading = true;
    this.error = '';
    try {
      this.psicologos = await this.supabaseService.buscarPsicologos();
      console.log(this.psicologos);
    } catch (err: any) {
      this.error = 'Erro ao carregar psicólogos';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}
