import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  WuiButton,
  WuiFormField,
  WuiInput,
  WuiLabel,
  WuiOption,
  WuiPage,
  WuiPageContent,
  WuiPageService,
  WuiScrollbar,
  WuiSelect,
  WuiRadioGroup,
  WuiRadioButton,
} from '@wajek/wui';
import { Highlight } from 'ngx-highlightjs';
import { firstValueFrom } from 'rxjs';
import { ShowcaseComponent, ShowcaseTab } from '../../../shared/showcase';

export interface ExampleScript {
  ts?: string;
  html?: string;
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
    WuiPageContent,
    WuiScrollbar,
    WuiRadioGroup,
    WuiRadioButton,
    Highlight,
    ShowcaseComponent,
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

  // Panduan import directive
  readonly importGuideSnippet = `import { WuiFormField, WuiInput, WuiLabel, WuiSelect, WuiOption } from '@wajek/wui';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-form',
  imports: [
    ReactiveFormsModule, // atau FormsModule
    WuiFormField,        // Komponen kontainer (<wui-form-field>)
    WuiInput,            // Directive kontrol (<input wuiInput>, <textarea wuiInput>, <wui-select wuiInput>)
    WuiLabel,            // Directive floating label (<label wuiLabel>)
    WuiSelect,           // (Opsional) Dropdown kustom WUI (<wui-select>)
    WuiOption,           // (Opsional) Item pilihan dropdown (<wui-option>)
  ],
  templateUrl: './my-form.html',
})
export class MyFormComponent {}`;

  // Computed Showcase Tabs
  readonly simpleTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.simple().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.simple().ts ?? '', language: 'typescript' },
  ]);

  readonly filledTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.filled().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.filled().ts ?? '', language: 'typescript' },
  ]);

  readonly emailTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.emailValidation().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.emailValidation().ts ?? '', language: 'typescript' },
  ]);

  readonly requiredLengthTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.requiredLength().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.requiredLength().ts ?? '', language: 'typescript' },
  ]);

  readonly textareaTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.textareaSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.textareaSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly selectTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.selectField().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.selectField().ts ?? '', language: 'typescript' },
  ]);

  readonly reactiveFullTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.reactiveFull().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.reactiveFull().ts ?? '', language: 'typescript' },
  ]);

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
    tipeAkun: new FormControl('personal', {
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
}
