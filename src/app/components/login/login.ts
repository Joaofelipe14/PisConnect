import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  tipoUsuario: 'paciente' | 'psicologo' = 'paciente';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { email, senha } = this.loginForm.value;

    this.authService.login(this.tipoUsuario, email, senha).subscribe({
  next: () => {
    this.router.navigate(['/meus-dados']);
  },
  error: (error) => {
    this.errorMessage = 'Email ou senha inválidos. Verifique suas credenciais.';
    console.error('Erro no login:', error);
  },
  complete: () => {
    this.loading = false;
  }
});
    }
  }

  setTipoUsuario(tipo: 'paciente' | 'psicologo') {
    this.tipoUsuario = tipo;
    this.errorMessage = '';
  }
}