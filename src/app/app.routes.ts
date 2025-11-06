import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { CadastroPsicologoComponent } from './components/cadastro-psicologo/cadastro-psicologo';
import { ListaPsicologos } from './components/lista-psicologos/lista-psicologos';
import { WelcomeComponent } from './components/welcome/welcome';
import { DetalhesPsicologoComponent } from './components/detalhes-psicologo/detalhes-psicologo';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro-psicologo', component: CadastroPsicologoComponent },
  { path: 'lista-psicologos', component: ListaPsicologos },
  { path: 'psicologo/:id', component: DetalhesPsicologoComponent },
  { path: '**', redirectTo: '' },

  // { path: 'cadastro-paciente', component: CadastroPaciente},
  // { path: 'meus-dados', component: MeusDados, canActivate: [AuthGuard] }
];