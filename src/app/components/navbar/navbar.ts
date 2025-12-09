import { Component, OnInit, Inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [CommonModule, RouterModule],
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  currentUser: any = null;
  tipoUsuario: string = '';
  menuOpen = false;
  isBrowser = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd && this.isBrowser) {
        window.scrollTo({ top: 0 });
      }
    });
  }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenuOnMobile() {
    if (this.isBrowser && window.innerWidth <= 768) {
      this.menuOpen = false;
      window.scrollTo({ top: 0 });
    }
  }

  logout() {
    if (window.confirm('Deseja sair do aplicativo?')) {
      this.authService.logout();
      this.router.navigate(['/login']);

    }
  }
}
