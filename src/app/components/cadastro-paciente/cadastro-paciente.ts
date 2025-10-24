import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro-paciente',
  imports:[CommonModule,ReactiveFormsModule],
  templateUrl: './cadastro-paciente.html',
  styleUrls: ['./cadastro-paciente.css']
})
export class CadastroPacienteComponent {
 
}