import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WuiButton, WuiPage, WuiPageService, WuiRadioButton, WuiRadioGroup } from '@wajek/wui';
import { firstValueFrom } from 'rxjs';
import { ShowcaseComponent, ShowcaseTab } from '../../shared/showcase';

export interface RadioSnippet {
  html?: string;
  ts?: string;
}

@Component({
  selector: 'app-radio-page',
  imports: [
    RouterLink,
    FormsModule,
    WuiPage,
    WuiButton,
    WuiRadioGroup,
    WuiRadioButton,
    ShowcaseComponent,
  ],
  templateUrl: './radio.page.html',
  styleUrl: './radio.page.scss',
})
export class RadioPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild.required<TemplateRef<unknown>>('pageTpl');

  // Interactive Live Preview State
  readonly selectedColor = signal('merah');
  readonly selectedStatus = signal('arsip');
  readonly isDisabled = signal(true);
  readonly shippingMethod = signal('reguler');
  readonly plan = signal('pro');

  // Snippets
  readonly basicSnippet = signal<RadioSnippet>({});
  readonly disabledSnippet = signal<RadioSnippet>({});
  readonly verticalSnippet = signal<RadioSnippet>({});
  readonly richLabelSnippet = signal<RadioSnippet>({});

  // Computed Showcase Tabs
  readonly basicTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.basicSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.basicSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly disabledTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.disabledSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.disabledSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly verticalTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.verticalSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.verticalSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly richLabelTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.richLabelSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.richLabelSnippet().ts ?? '', language: 'typescript' },
  ]);

  async ngOnInit(): Promise<void> {
    this.pageService.replace(this.pageTpl(), { variant: 'full' });

    const [
      basicHtml,
      basicTs,
      disabledHtml,
      disabledTs,
      verticalHtml,
      verticalTs,
      richLabelHtml,
      richLabelTs,
    ] = await Promise.all([
      this.fetchSnippet('basic/basic.html'),
      this.fetchSnippet('basic/basic.ts'),
      this.fetchSnippet('disabled/disabled.html'),
      this.fetchSnippet('disabled/disabled.ts'),
      this.fetchSnippet('vertical/vertical.html'),
      this.fetchSnippet('vertical/vertical.ts'),
      this.fetchSnippet('rich-label/rich-label.html'),
      this.fetchSnippet('rich-label/rich-label.ts'),
    ]);

    this.basicSnippet.set({ html: basicHtml, ts: basicTs });
    this.disabledSnippet.set({ html: disabledHtml, ts: disabledTs });
    this.verticalSnippet.set({ html: verticalHtml, ts: verticalTs });
    this.richLabelSnippet.set({ html: richLabelHtml, ts: richLabelTs });
  }

  toggleDisabled(): void {
    this.isDisabled.update((val) => !val);
  }

  private async fetchSnippet(path: string): Promise<string> {
    try {
      return await firstValueFrom(
        this.http.get(`snippets/radio/${path}`, { responseType: 'text' })
      );
    } catch {
      return `<!-- Gagal memuat snippet: ${path} -->`;
    }
  }
}