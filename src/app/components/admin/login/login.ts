import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: '../../login/login.html',
  styleUrls: ['../../login/login.css']
})


export class Login implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone) {
    // Inicializa o formulário
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void { }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { email, senha } = this.loginForm.value;

    try {
      const user = await this.supabaseService.signIn(email, senha);
      if (user) {
        console.log(user)
        // Redireciona para a home ou dashboard
        this.router.navigate(['/admin/piscologos']);
      }
    } catch (err: any) {
      this.ngZone.run(() => {
        // Trata diferentes tipos de erro
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.message) {
          this.errorMessage = err.message;
        } else if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Email ou senha inválidos.';
        }

        console.log('errorMessage definido como:', this.errorMessage);
        this.loading = false;
        this.cdr.markForCheck();
        console.log('markForCheck chamado');
      });

      this.errorMessage = err.message || 'Erro ao fazer login';
    } finally {
      this.loading = false;
    }
  }
}