import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { RouterModule } from '@angular/router';
import { SOCIOPSI_CONTACT } from '../constants/social-media';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  currentYear = new Date().getFullYear();
  
  // Constantes de contato
  contact = SOCIOPSI_CONTACT;

  // Ícones
  faInstagram = faInstagram;
  faLinkedin = faLinkedinIn;
  faEnvelope = faEnvelope;
  faPhone = faPhone;

  // Formata o número de telefone para link
  getPhoneLink(): string {
    return `tel:${this.contact.phone.replace(/\s/g, '').replace(/[()]/g, '').replace(/-/g, '')}`;
  }
}
