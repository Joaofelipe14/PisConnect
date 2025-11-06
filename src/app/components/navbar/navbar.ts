import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports:[CommonModule, RouterModule],
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  currentUser: any = null;
  tipoUsuario: string = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}


  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });

    // this.authService.tipoUsuario.subscribe(tipo => {
    //   this.tipoUsuario = tipo;
    // });
  }

   menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenuOnMobile() {
    if (window.innerWidth <= 768) {
      this.menuOpen = false;
    }
  }

  logout() {
    this.authService.logout();
  }
}