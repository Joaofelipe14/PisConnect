import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.css'],
})
export class WelcomeComponent {
  constructor(private router: Router) {}

  goToPaciente() {
    this.router.navigate(['/lista-psicologos']);
  }

  goToPsicologo() {
    this.router.navigate(['/cadastro-psicologo']);
  }
}

