import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  WuiButton,
  WuiFormField,
  WuiInput,
  WuiLabel,
  WuiOption,
  WuiPage,
  WuiPageService,
  WuiSelect,
} from '@wajek/wui';
import { Highlight } from 'ngx-highlightjs';
import { firstValueFrom } from 'rxjs';

export interface ExampleScript {
  ts?: string;
  html?: string;
}

export type CodeTab = 'html' | 'ts';

export type CardKey =
  | 'simple'
  | 'filled'
  | 'email'
  | 'requiredLength'
  | 'textarea'
  | 'select'
  | 'reactiveFull';

export interface FormActiveTabs {
  simple: CodeTab;
  filled: CodeTab;
  email: CodeTab;
  requiredLength: CodeTab;
  textarea: CodeTab;
  select: CodeTab;
  reactiveFull: CodeTab;
}

export interface FormShowCode {
  simple: boolean;
  filled: boolean;
  email: boolean;
  requiredLength: boolean;
  textarea: boolean;
  select: boolean;
  reactiveFull: boolean;
}

@Component({
  selector: 'app-form.page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    WuiButton,
    WuiFormField,
    WuiInput,
    WuiLabel,
    WuiSelect,
    WuiOption,
    WuiPage,
    Highlight,
  ],
  templateUrl: './form.page.html',
  styleUrl: './form.page.scss',
})
export class FormPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  // Snippets
  readonly simple = signal<ExampleScript>({});
  readonly filled = signal<ExampleScript>({});
  readonly emailValidation = signal<ExampleScript>({});
  readonly requiredLength = signal<ExampleScript>({});
  readonly textareaSnippet = signal<ExampleScript>({});
  readonly selectField = signal<ExampleScript>({});
  readonly reactiveFull = signal<ExampleScript>({});

  // Active Code Tabs per Card ('html' | 'ts')
  readonly activeTabs = signal<FormActiveTabs>({
    simple: 'html',
    filled: 'html',
    email: 'html',
    requiredLength: 'html',
    textarea: 'html',
    select: 'html',
    reactiveFull: 'html',
  });

  // Code Visibility Toggle per Card
  readonly showCode = signal<FormShowCode>({
    simple: true,
    filled: true,
    email: true,
    requiredLength: true,
    textarea: true,
    select: true,
    reactiveFull: true,
  });

  // --- Interactive Form Controls for Live Demos ---

  // 1. Email Validation Demo
  readonly demoEmailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  get pesanEmailDemo(): string {
    const ctrl = this.demoEmailControl;
    if (!ctrl.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'Alamat email wajib diisi.';
    if (ctrl.hasError('email')) return 'Format email tidak valid (contoh: nama@domain.com).';
    return 'Email tidak valid.';
  }

  // 2. Required & Length Validation Demo
  readonly demoUsernameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20)],
  });

  get pesanUsernameDemo(): string {
    const ctrl = this.demoUsernameControl;
    if (!ctrl.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'Nama pengguna wajib diisi.';
    if (ctrl.hasError('minlength')) return 'Minimal 3 karakter.';
    if (ctrl.hasError('maxlength')) return 'Maksimal 20 karakter.';
    return 'Input tidak valid.';
  }

  // 3. Textarea Demo
  readonly demoCatatanControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(200)],
  });

  get pesanCatatanDemo(): string {
    const ctrl = this.demoCatatanControl;
    if (!ctrl.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'Catatan pengiriman wajib diisi.';
    if (ctrl.hasError('maxlength')) return 'Catatan maksimal 200 karakter.';
    return 'Input tidak valid.';
  }

  // 4. Select Field Demo
  readonly demoRole = signal<string>('');
  readonly demoRoleTouched = signal<boolean>(false);

  get pesanRoleDemo(): string {
    if (!this.demoRoleTouched()) return '';
    if (!this.demoRole()) return 'Peran akun wajib dipilih.';
    return '';
  }

  onRoleChange(val: unknown): void {
    this.demoRole.set(String(val ?? ''));
    this.demoRoleTouched.set(true);
  }

  // 5. Full Reactive Form Demo
  readonly fullForm = new FormGroup({
    namaLengkap: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    departemen: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    catatan: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
  });

  readonly fullFormStatus = signal<string>('(formulir belum dikirim)');

  onDepartemenChange(val: unknown): void {
    this.fullForm.controls.departemen.setValue(String(val ?? ''));
    this.fullForm.controls.departemen.markAsTouched();
  }

  pesanFull(field: 'namaLengkap' | 'email' | 'departemen' | 'catatan'): string {
    const ctrl = this.fullForm.controls[field];
    if (!ctrl.touched || ctrl.valid) return '';
    if (ctrl.hasError('required')) return 'Bidang ini wajib diisi/dipilih.';
    if (ctrl.hasError('minlength')) return 'Minimal 3 karakter.';
    if (ctrl.hasError('maxlength')) return 'Maksimal 150 karakter.';
    if (ctrl.hasError('email')) return 'Format email tidak valid.';
    return 'Nilai tidak valid.';
  }

  simpanFull(): void {
    this.fullForm.markAllAsTouched();
    if (this.fullForm.invalid) {
      this.fullFormStatus.set('Gagal: Ada bidang yang belum valid.');
      return;
    }
    this.fullFormStatus.set(JSON.stringify(this.fullForm.getRawValue(), null, 2));
  }

  resetFull(): void {
    this.fullForm.reset();
    this.fullFormStatus.set('(formulir direset)');
  }

  async ngOnInit(): Promise<void> {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });

    // Load all snippets in parallel
    const [simple, filled, email, reqLength, textarea, select, reactiveFull] = await Promise.all([
      this.fetchSnippet('simple', 'simple'),
      this.fetchSnippet('filled', 'filled'),
      this.fetchSnippet('email-validation', 'email-validation'),
      this.fetchSnippet('required-length', 'required-length'),
      this.fetchSnippet('textarea', 'textarea'),
      this.fetchSnippet('select-field', 'select-field'),
      this.fetchSnippet('reactive-full', 'reactive-full'),
    ]);

    this.simple.set(simple);
    this.filled.set(filled);
    this.emailValidation.set(email);
    this.requiredLength.set(reqLength);
    this.textareaSnippet.set(textarea);
    this.selectField.set(select);
    this.reactiveFull.set(reactiveFull);
  }

  private async fetchSnippet(dir: string, file: string): Promise<ExampleScript> {
    try {
      const [ts, html] = await Promise.all([
        firstValueFrom(
          this.http.get(`snippets/forms/text-field/${dir}/${file}.ts`, { responseType: 'text' }),
        ).catch(() => '// Snippet TypeScript tidak ditemukan.'),
        firstValueFrom(
          this.http.get(`snippets/forms/text-field/${dir}/${file}.html`, { responseType: 'text' }),
        ).catch(() => '<!-- Snippet HTML tidak ditemukan. -->'),
      ]);
      return { ts, html };
    } catch {
      return {
        ts: '// Gagal memuat snippet TypeScript.',
        html: '<!-- Gagal memuat snippet HTML. -->',
      };
    }
  }

  setTab(key: CardKey, tab: CodeTab): void {
    this.activeTabs.update((prev) => ({ ...prev, [key]: tab }));
  }

  toggleCode(key: CardKey): void {
    this.showCode.update((prev) => ({ ...prev, [key]: !prev[key] }));
  }
}
