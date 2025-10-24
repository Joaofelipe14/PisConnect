import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { CadastroPsicologoComponent } from './components/cadastro-psicologo/cadastro-psicologo';
import { ListaPsicologos } from './components/lista-psicologos/lista-psicologos';

export const routes: Routes = [
  { path: '*', component: ListaPsicologos },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro-psicologo', component: CadastroPsicologoComponent },
  { path: 'lista-psicologos', component: ListaPsicologos },

  // { path: 'cadastro-paciente', component: CadastroPaciente},
  // { path: 'meus-dados', component: MeusDados, canActivate: [AuthGuard] }
      // { path: 'lista-psicologos/?id', component: ListaPsicologos }, cria

];