import { Routes } from '@angular/router';
import {  LoginComponent } from './components/login/login';
import { CadastroPsicologoComponent } from './components/cadastro-psicologo/cadastro-psicologo';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  // { path: 'cadastro-paciente', component: CadastroPaciente},
  { path: 'cadastro-psicologo', component: CadastroPsicologoComponent },
  // { path: 'lista-psicologos', component: ListaPsicologos},
  // { path: 'meus-dados', component: MeusDados, canActivate: [AuthGuard] }
];