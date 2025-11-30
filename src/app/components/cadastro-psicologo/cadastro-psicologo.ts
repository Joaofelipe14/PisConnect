import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ALL_ABORDAGENS, ALL_AREAS, ALL_PUBLICOS } from '../constants';

@Component({
  selector: 'app-cadastro-psicologo',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './cadastro-psicologo.html',
  styleUrls: ['./cadastro-psicologo.css'],
})
export class CadastroPsicologoComponent {
  step = 1;
  loading = false;
  successMessage = '';
  errorMessage = '';

  allAreas = ALL_AREAS
  allAbordagens = ALL_ABORDAGENS
  allPublicos = ALL_PUBLICOS;
  // Estados de busca
  searchAreas = '';
  searchAbordagens = '';
  searchPublicos = '';
  showAreasDropdown = false;
  showAbordagensDropdown = false;
  showPublicosDropdown = false;

  cadastroForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,

  ) {
    this.initForm();
  }

  private initForm(): void {
    this.cadastroForm = this.fb.group({
      nome: ['João Silva', [Validators.required, Validators.minLength(3)]],
      email: ['joao.silva@exampl1e.com', [Validators.required, Validators.email]],
      senha: ['123456', [Validators.required, Validators.minLength(6)]],
      confirma_senha: ['123456', Validators.required],
      crp: ['12/12356', [Validators.required, Validators.pattern(/^\d{2}\/\d{5,6}$/)]],
      resumo: ['Psicólogo com mais de 10 anos de experiência em diversos contextos e abordagens terapêuticas.', [Validators.required, Validators.minLength(50)]],
      whatsapp: ['(11) 98765-4321', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      formacao: ['Graduação em Psicologia pela Universidade XYZ', [Validators.required, Validators.minLength(20)]],
      areas_atuacao: [['Psicologia Clínica', 'Psicologia Escolar'], Validators.required],
      abordagem_terapeutica: [['Terapia Cognitivo-Comportamental (TCC)', 'Psicanálise'], Validators.required],
      publico_alvo: [['Adultos', 'Crianças'], Validators.required],
      redes_sociais: this.fb.array([
        this.fb.control('https://facebook.com/joaosilva', [Validators.pattern(/^https?:\/\/.+/)])
      ]),
            cpf: ['04462013328', [Validators.required, Validators.minLength(7)]],

    });
  }

  // private initForm(): void {
  //   this.cadastroForm = this.fb.group({
  //     nome: ['', [Validators.required, Validators.minLength(3)]],
  //     email: ['', [Validators.required, Validators.email]],
  //     senha: ['', [Validators.required, Validators.minLength(6)]],
  //     confirma_senha: ['', Validators.required],
  //     crp: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{5,6}$/)]],
  //     resumo: ['', [Validators.required, Validators.minLength(50)]],
  //     whatsapp: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
  //     formacao: ['', [Validators.required, Validators.minLength(20)]],
  //     areas_atuacao: [[], Validators.required],
  //     abordagem_terapeutica: [[], Validators.required],
  //     publico_alvo: [[], Validators.required],
  //     redes_sociais: this.fb.array([]),
  //     cpf: ['', [Validators.required, Validators.minLength(7)]],
      

  //   });
  // }

  formatCPF(e: any) {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  e.target.value = v;
  this.cadastroForm.get('cpf')?.setValue(v, { emitEvent: false });
}

  get redesSociais(): FormArray {
    return this.cadastroForm.get('redes_sociais') as FormArray;
  }

  get filteredAreas(): string[] {
    return this.allAreas.filter(a =>
      a.toLowerCase().includes(this.searchAreas.toLowerCase())
    );
  }

  get filteredAbordagens(): string[] {
    return this.allAbordagens.filter(a =>
      a.toLowerCase().includes(this.searchAbordagens.toLowerCase())
    );
  }

  get filteredPublicos(): string[] {
    return this.allPublicos.filter(p =>
      p.toLowerCase().includes(this.searchPublicos.toLowerCase())
    );
  }

  get selectedAreas(): string[] {
    return this.cadastroForm.get('areas_atuacao')?.value || [];
  }

  get selectedAbordagens(): string[] {
    return this.cadastroForm.get('abordagem_terapeutica')?.value || [];
  }

  get selectedPublicos(): string[] {
    return this.cadastroForm.get('publico_alvo')?.value || [];
  }

  addItem(field: string, item: string): void {
    const current = this.cadastroForm.get(field)?.value || [];
    if (!current.includes(item)) {
      this.cadastroForm.patchValue({ [field]: [...current, item] });
    }

    // Limpar busca e fechar dropdown
    if (field === 'areas_atuacao') {
      this.searchAreas = '';
      this.showAreasDropdown = false;
    } else if (field === 'abordagem_terapeutica') {
      this.searchAbordagens = '';
      this.showAbordagensDropdown = false;
    } else if (field === 'publico_alvo') {
      this.searchPublicos = '';
      this.showPublicosDropdown = false;
    }
  }

  removeItem(field: string, item: string): void {
    const current = this.cadastroForm.get(field)?.value || [];
    this.cadastroForm.patchValue({
      [field]: current.filter((i: string) => i !== item)
    });
  }

  addRede(): void {
    this.redesSociais.push(this.fb.control('', [Validators.pattern(/^https?:\/\/.+/)]));
  }

  removeRede(index: number): void {
    this.redesSociais.removeAt(index);
  }

  nextStep(): void {
    if (this.step === 1) {
      const step1Fields = ['nome', 'email', 'crp', 'resumo', 'whatsapp'];
      const isStep1Valid = step1Fields.every(field =>
        this.cadastroForm.get(field)?.valid
      );
      if (!isStep1Valid) {
        this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
        return;
      }
    }

    if (this.step === 2) {
      const step2Fields = ['areas_atuacao', 'abordagem_terapeutica', 'publico_alvo', 'formacao'];
      const isStep2Valid = step2Fields.every(field => {
        const control = this.cadastroForm.get(field);
        return field.includes('_') ? control?.value?.length > 0 : control?.valid;
      });
      if (!isStep2Valid) {
        this.errorMessage = 'Por favor, selecione ao menos uma opção em cada campo.';
        return;
      }
    }

    this.errorMessage = '';
    this.step++;
  }

  prevStep(): void {
    this.step--;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.cadastroForm.valid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    const senha = this.cadastroForm.get('senha')?.value;
    const confirmaSenha = this.cadastroForm.get('confirma_senha')?.value;

    if (senha !== confirmaSenha) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const data = {
      ...this.cadastroForm.value,
      criado_em: new Date()
    };

    delete data.confirma_senha;

    this.auth.cadastro('psicologo', data).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = 'Cadastro realizado com sucesso! Redirecionando...';
          this.loading = false;
          this.cadastroForm.reset();
        });
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error) => {
        this.ngZone.run(() => {

          const errMessage = error?.error?.error || error?.message || '';

          // --- Tratamento de erros específicos ---
          if (errMessage.includes('psicologos_email_key')) {
            this.errorMessage = 'O e-mail informado já está cadastrado em nossa base.';
          }
          else if (errMessage.includes('psicologos_crp_key')) {
            this.errorMessage = 'O CRP informado já está cadastrado em nossa base.';
          }
          else {
            this.errorMessage = 'Erro ao cadastrar. Tente novamente.';
          }

          this.loading = false;

          // debug opcional
          this.cdr.markForCheck();
          console.log('markForCheck chamado');
        });
      }

    });
  }

  formatWhatsApp(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 10) {
      value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    }

    input.value = value;
    this.cadastroForm.patchValue({ whatsapp: value });
  }

  formatCRP(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 8) value = value.slice(0, 8);

    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    input.value = value;
    this.cadastroForm.patchValue({ crp: value });
  }

  closeDropdownWithDelay(dropdown: 'areas' | 'abordagens' | 'publicos'): void {
    setTimeout(() => {
      if (dropdown === 'areas') {
        this.showAreasDropdown = false;
      } else if (dropdown === 'abordagens') {
        this.showAbordagensDropdown = false;
      } else if (dropdown === 'publicos') {
        this.showPublicosDropdown = false;
      }
    }, 200);
  }
}