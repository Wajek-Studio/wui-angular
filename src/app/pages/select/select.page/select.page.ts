import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import {
  WuiButton,
  WuiFormField,
  WuiIcon,
  WuiInput,
  WuiLabel,
  WuiOption,
  WuiPage,
  WuiPageService,
  WuiSelect,
} from '@wajek/wui';
import { firstValueFrom } from 'rxjs';
import { ShowcaseComponent, ShowcaseTab } from '../../../shared/showcase';

export interface SelectSnippet {
  html?: string;
  ts?: string;
}

/**
 * Halaman demo `<wui-select>`.
 *
 * Menggunakan ShowcaseComponent untuk menyajikan live preview interaktif beserta tab kode sumber HTML dan TypeScript.
 */
@Component({
  selector: 'app-select.page',
  imports: [
    WuiButton,
    WuiFormField,
    WuiIcon,
    WuiInput,
    WuiLabel,
    WuiOption,
    WuiPage,
    WuiSelect,
    ShowcaseComponent,
  ],
  templateUrl: './select.page.html',
})
export class SelectPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  /** Nilai contoh yang bisa diisi/dikosongkan dari halaman — diisi opsi di tengah ('Bekasi'). */
  protected readonly kota = signal<unknown>('Bekasi');

  /** Field kedua dengan nilai awal, supaya keadaan "sudah terisi" bisa dibandingkan. */
  protected readonly negara = signal<unknown>('Indonesia');

  /** Nilai select pada bagian "desain opsi sendiri" — opsinya bervalue eksplisit. */
  protected readonly kotaKaya = signal<unknown>(null);

  // Snippets
  readonly outlinedSnippet = signal<SelectSnippet>({});
  readonly filledSnippet = signal<SelectSnippet>({});
  readonly statesSnippet = signal<SelectSnippet>({});
  readonly richOptionsSnippet = signal<SelectSnippet>({});

  // Dynamic Tabs for ShowcaseComponent
  readonly outlinedTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.outlinedSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.outlinedSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly filledTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.filledSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.filledSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly statesTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.statesSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.statesSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly richOptionsTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.richOptionsSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.richOptionsSnippet().ts ?? '', language: 'typescript' },
  ]);

  async ngOnInit(): Promise<void> {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });

    // Load snippet select secara paralel dari public/snippets/select/
    const [outlined, filled, states, richOptions] = await Promise.all([
      this.fetchSnippet('outlined'),
      this.fetchSnippet('filled'),
      this.fetchSnippet('states'),
      this.fetchSnippet('rich-options'),
    ]);

    this.outlinedSnippet.set(outlined);
    this.filledSnippet.set(filled);
    this.statesSnippet.set(states);
    this.richOptionsSnippet.set(richOptions);
  }

  private async fetchSnippet(name: string): Promise<SelectSnippet> {
    try {
      const [html, ts] = await Promise.all([
        firstValueFrom(this.http.get(`snippets/select/${name}/${name}.html`, { responseType: 'text' })).catch(() => ''),
        firstValueFrom(this.http.get(`snippets/select/${name}/${name}.ts`, { responseType: 'text' })).catch(() => ''),
      ]);
      return { html, ts };
    } catch {
      return {};
    }
  }

  protected isi(): void {
    this.kota.set('Bandung');
  }

  protected kosongkan(): void {
    this.kota.set('');
  }
}
