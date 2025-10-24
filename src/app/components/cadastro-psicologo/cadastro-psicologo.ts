import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-cadastro-psicologo',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './cadastro-psicologo.html',
  styleUrls: ['./cadastro-psicologo.css'],
})
export class CadastroPsicologoComponent {
  cadastroForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.cadastroForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha_hash: ['', [Validators.required, Validators.minLength(6)]],
      crp: ['', Validators.required],
      valor_consulta: ['', Validators.required],
    });
  }

  onSubmit() {
    if (!this.cadastroForm.valid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const data: any = { ...this.cadastroForm.value, criado_em: new Date() };

    this.auth.cadastro('psicologo', data).subscribe({
      next: () => {
        this.successMessage = 'Psicólogo cadastrado com sucesso!';
        this.cadastroForm.reset();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Erro ao cadastrar psicólogo. Tente novamente.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

}
