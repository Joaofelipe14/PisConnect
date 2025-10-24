import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'app-lista-psicologos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-psicologos.html',
  styleUrls: ['./lista-psicologos.css'],
})
export class ListaPsicologos implements OnInit {
  psicologos$!: Observable<any[]>;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.psicologos$ = from(this.supabaseService.buscarPsicologos());
  }
}
