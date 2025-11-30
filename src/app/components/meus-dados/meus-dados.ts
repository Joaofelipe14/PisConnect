import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Loading } from '../../loading/loading';
import planosJson from './planos.json';
import { ALL_ABORDAGENS, ALL_AREAS, ALL_PUBLICOS } from '../constants';
import { S3StorageService } from '../../services/s3-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { CardModalComponent } from '../../card-modal/card-modal';
import { ordem } from '../../services/ordem';
import { ConfirmAssinaturaDialog } from '../../confirm-assinatura-dialog/confirm-assinatura-dialog';

@Component({
  selector: 'app-meus-dados',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, Loading],
  templateUrl: './meus-dados.html',
  styleUrls: ['./meus-dados.css'],
})
export class MeusDadosComponent implements OnInit {

  loading = false;
  errorMessage = '';
  successMessage = '';
  meusDadosForm!: FormGroup;
  today: string = new Date().toISOString().split('T')[0];
  assinaturasTotais: {
    total: string,
    pagas: string,
    pendentes: string,
    vencidas: string
  }[] = [];
  // Listas completas


  // busca dos inputs
  searchAreas = '';
  searchAbordagens = '';
  searchPublicos = '';
  mensagemDeCarregamento = "Carregando seus dados...";
  showAreasDropdown = false;
  showAbordagensDropdown = false;
  showPublicosDropdown = false;

  showSection = {
    dadosPessoais: true,
    especializacoes: false,
    areasAbordagensPublicos: false,
    redesSociais: false,
    pagamentos: false

  };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private s3service: S3StorageService,
    private dialog: MatDialog,
    private ordem: ordem
  ) { }

  allAreas = ALL_AREAS
  allAbordagens = ALL_ABORDAGENS
  allPublicos = ALL_PUBLICOS;
  planos = planosJson;

  ngOnInit() {
    this.initForm();
    this.loadUserData();
  }
  user: any
  initForm() {
    this.meusDadosForm = this.fb.group({
      nome: ['', Validators.required],
      email: [{ value: '', disabled: true }, Validators.required],
      crp: [{ value: '', disabled: true }, Validators.required],
      whatsapp: ['', Validators.required],
      resumo: ['', Validators.required],
      formacao: ['', Validators.required],
      areas_atuacao: [[]],
      abordagem_terapeutica: [[]],
      publico_alvo: [[]],
      redes_sociais: this.fb.array([]),
      foto_url: [''],
      cpf: ['', Validators.required]
    });
  }

  // ---------------------------
  //   GETTERS
  // ---------------------------

  get redesSociais(): FormArray {
    return this.meusDadosForm.get('redes_sociais') as FormArray;
  }

  get filteredAreas() {
    return this.allAreas.filter(a =>
      a.toLowerCase().includes(this.searchAreas.toLowerCase())
    );
  }

  get filteredAbordagens() {
    return this.allAbordagens.filter(a =>
      a.toLowerCase().includes(this.searchAbordagens.toLowerCase())
    );
  }

  get filteredPublicos() {
    return this.allPublicos.filter(a =>
      a.toLowerCase().includes(this.searchPublicos.toLowerCase())
    );
  }


  get selectedAreas(): string[] {
    return this.meusDadosForm.get('areas_atuacao')?.value || [];
  }

  get selectedAbordagens(): string[] {
    return this.meusDadosForm.get('abordagem_terapeutica')?.value || [];
  }

  get selectedPublicos(): string[] {
    return this.meusDadosForm.get('publico_alvo')?.value || [];
  }
  // ---------------------------
  //   LOADING USER DATA
  // ---------------------------
  // Função genérica para fazer parse de valores JSON
  parseJson(value: any): any {
    if (typeof value === 'string') {
      try {
        // Tenta fazer o parse da string JSON para um objeto ou array
        return JSON.parse(value);
      } catch (e) {
        // Se falhar, retorna um array vazio ou um objeto vazio, dependendo do tipo esperado
        return [];
      }
    }
    return value || []; // Se não for string, retorna o próprio valor ou um array vazio
  }

  getStatusTexto(assinaturaItem: any): string {
    if (!assinaturaItem || !assinaturaItem.assinatura) return 'Indisponível';

    return 'Ativa';
  }


  formatCPF(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (!value) {
      this.meusDadosForm.patchValue({ cpf: '' });
      return;
    }

    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 3) value = value.replace(/(\d{3})(\d)/, '$1.$2');
    if (value.length > 6) value = value.replace(/(\d{3})(\d)/, '$1.$2');
    if (value.length > 9) value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    input.value = value;
    this.meusDadosForm.patchValue({ cpf: value });
  }

  loadUserData() {
    this.loading = true;

    this.auth.me().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          const user = res.user;
          this.user = user;

          if (user.cpf) {
            this.meusDadosForm.get('cpf')?.disable()

          } else {
            this.meusDadosForm.get('cpf')?.enable()

          }

          this.meusDadosForm.patchValue({
            nome: user.nome,
            email: user.email,
            crp: user.crp,
            whatsapp: user.whatsapp,
            resumo: user.resumo,
            formacao: user.formacao,
            areas_atuacao: user.areas_atuacao || [],
            abordagem_terapeutica: this.parseJson(user.abordagem_terapeutica),
            publico_alvo: this.parseJson(user.publico_alvo),
            foto_url: user.foto_url,
            cpf: user.cpf
          });


          this.fotoPreview = user.foto_url;

          this.redesSociais.clear();
          (user.redes_sociais || []).forEach((url: string) => {
            this.redesSociais.push(this.fb.control(url));
          });

          this.loading = false;
          this.cdr.markForCheck();
        });
      },

      error: () => {
        this.ngZone.run(() => {
          this.errorMessage = 'Erro ao carregar seus dados.';
          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }


  // ---------------------------
  //   ACTIONS
  // ---------------------------

  addItem(field: string, item: string) {
    const current = this.meusDadosForm.get(field)?.value;
    if (!current.includes(item)) {
      this.meusDadosForm.patchValue({ [field]: [...current, item] });
    }
  }

  removeItem(field: string, item: string) {
    const arr = this.meusDadosForm.get(field)?.value;
    this.meusDadosForm.patchValue({
      [field]: arr.filter((i: string) => i !== item)
    });
  }

  addRede() {
    this.redesSociais.push(this.fb.control(''));
  }

  removeRede(i: number) {
    this.redesSociais.removeAt(i);
  }

  // ---------------------------
  //   UPDATE USER
  // ---------------------------

  salvarAlteracoes() {
    if (this.meusDadosForm.invalid) {
      this.ngZone.run(() => {
        this.errorMessage = 'Preencha todos os campos obrigatórios.';
        this.cdr.markForCheck();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.auth.update(this.meusDadosForm.value).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = 'Dados atualizados com sucesso!';
          this.loading = false;

          this.cdr.markForCheck();
          console.log('markForCheck chamado (sucesso)');
        });
      },

      error: (error) => {
        this.ngZone.run(() => {
          const msg = error?.error?.error || error?.message || '';

          if (msg.includes('psicologos_email_key')) {
            this.errorMessage = 'O e-mail informado já está cadastrado em nossa base.';
          }
          else if (msg.includes('psicologos_crp_key')) {
            this.errorMessage = 'O CRP informado já está cadastrado em nossa base.';
          }
          else {
            this.errorMessage = 'Erro ao salvar alterações. Tente novamente.';
          }

          this.loading = false;

          this.cdr.markForCheck();
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
    this.meusDadosForm.patchValue({ whatsapp: value });
  }

  formatCRP(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 8) value = value.slice(0, 8);

    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    input.value = value;
    this.meusDadosForm.patchValue({ crp: value });
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

  // ---------------------------
  //   CONTROLADOR DAS SEÇÕES EXPANSÍVEIS
  // ---------------------------

  async toggleSection(section: keyof typeof this.showSection) {
    // Primeiro, desativa todas as seções
    Object.keys(this.showSection).forEach(key => {
      this.showSection[key as keyof typeof this.showSection] = false;
    });

    this.showSection[section] = true;
    if (section == 'pagamentos' && this.assinaturas.length == 0) {
      this.loadingPagamentos = true;
      await this.carregarAssinaturas()
    }
  }

  fotoUploadStatus = '';
  fotoPreview = '';

  async uploadFoto(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.fotoUploadStatus = "Enviando foto...";
    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeInBytes) {
      this.fotoUploadStatus = "O arquivo excede o tamanho máximo de 10 MB.";
      return;
    }
    try {
      // Mostra Preview
      const reader = new FileReader();
      reader.onload = () => {
        this.ngZone.run(() => {
          this.fotoPreview = reader.result as string;
          this.cdr.markForCheck();
        });
      };
      reader.readAsDataURL(file);

      // Upload no Supabase
      const fotoUrl = await this.s3service.uploadFotoPerfil(this.user.id, file);

      // Salva a URL no form e na variável foto_url
      this.ngZone.run(() => {
        this.meusDadosForm.patchValue({ foto_url: fotoUrl });
        this.fotoUploadStatus = "Foto salva com sucesso!";
        this.cdr.markForCheck();
      });

    } catch (error) {
      console.error(error);
      this.ngZone.run(() => {
        this.fotoPreview = ''
        this.fotoUploadStatus = "Erro ao enviar foto.";
        this.cdr.markForCheck();
      });
    }
  }

  openCardModal(plano: any) {
    const dialogRef = this.dialog.open(CardModalComponent, {
      width: '90%',
      maxWidth: '600px',
      maxHeight: '95vh',
      panelClass: 'card-modal-panel',
      data: plano // passando o plano selecionado
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Aqui você faz a requisição pro seu endpoint de assinatura
        // Ex: this.assinar(result)
      }
    });
  }


  assinaturas: any[] = [];
  historicoFaturas: any[] = [];
  loadingPagamentos = false;
  async carregarAssinaturas() {
    // buscar do getMe()
    const subscriptionIds = ['']; // ['30d0...', '30d1...', ...]

    if (subscriptionIds.length == 0) {
    }    // Mapeia cada ID para uma promessa que nunca rejeita
    const promises = subscriptionIds.map(id =>
      this.ordem.getMinhasAssinatura().toPromise()
        .then(res => res)
        .catch(err => {
          this.loadingPagamentos = false;
          return null; // retorna null se der erro, não quebra o Promise.all
        })
    );

    const results = await Promise.all(promises);

    this.ngZone.run(() => {
      if (results[0].assinaturas) {
        this.assinaturas = results[0].assinaturas
        if (this.assinaturas) {
          const todayTimestamp = new Date().getTime();

          this.assinaturas.forEach(item => {
            const cobrancas = item?.cobrancas || [];
            const totais = {
              total: cobrancas.length,
              pagas: cobrancas.filter((c: { status: string; }) => c?.status === 'RECEIVED').length,
              pendentes: cobrancas.filter((c: { status: string; dueDate: string | number | Date; }) =>
                c?.status === 'PENDING' && (!c?.dueDate || new Date(c.dueDate).getTime() >= todayTimestamp)
              ).length,
              vencidas: cobrancas.filter((c: { status: string; dueDate: string | number | Date; }) =>
                c?.status === 'PENDING' && c?.dueDate && new Date(c.dueDate).getTime() < todayTimestamp
              ).length
            };

            this.assinaturasTotais.push(totais);
          });
        }
      }
      this.loadingPagamentos = false;

      this.cdr.markForCheck();
    });
  }


  assinarPlano(plano: any) {
    const dialogRef = this.dialog.open(ConfirmAssinaturaDialog, {
      width: '400px',
      data: { plano }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.startLoadingAndAssinar(plano);
      }
    });

  }

  startLoadingAndAssinar(plano: any) {
    setTimeout(() => {
      this.loading = true;
      this.gerarAssinatura(plano);
      this.cdr.markForCheck();
    }, 100);
  }
  gerarAssinatura(plano: any) {
    this.mensagemDeCarregamento = "Criando assinatura";
    this.loading = true;
    const payload = { plano_id: plano.id };
    this.ordem.gerarOrdemAssinatura(payload).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          alert('Assinatura realizada com sucesso!');
          this.carregarAssinaturas()
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          console.error('Erro na assinatura:', err);
          alert('Erro ao assinar: ' + err);
          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  atualizarPagamento(plano: any) {
    console.log('Atualizar forma de pagamento');
    // abrir modal do cartão para atualizar card token
  }
 
  trocarPlano(plano: any) {
    console.log('Trocar plano');
    // abrir tela/modal para escolher novo plano
  }

}
