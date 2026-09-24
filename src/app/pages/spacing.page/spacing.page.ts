import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiButton, WuiPage, WuiPageContent, WuiPageService, WuiScrollbar } from '@wajek/wui';
import { firstValueFrom } from 'rxjs';
import { ShowcaseComponent, ShowcaseTab } from '../../shared/showcase';

export interface SpacingSnippet {
  html?: string;
  ts?: string;
}

@Component({
  selector: 'app-spacing.page',
  imports: [RouterLink, WuiPage, WuiPageContent, WuiScrollbar, WuiButton, ShowcaseComponent],
  templateUrl: './spacing.page.html',
  styleUrl: './spacing.page.scss',
})
export class SpacingPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  // Snippets
  readonly marginSnippet = signal<SpacingSnippet>({});
  readonly paddingSnippet = signal<SpacingSnippet>({});
  readonly autoMarginSnippet = signal<SpacingSnippet>({});
  readonly gapSnippet = signal<SpacingSnippet>({});

  // Tabs
  readonly marginTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.marginSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.marginSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly paddingTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.paddingSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.paddingSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly autoMarginTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.autoMarginSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.autoMarginSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly gapTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.gapSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.gapSnippet().ts ?? '', language: 'typescript' },
  ]);

  async ngOnInit(): Promise<void> {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });

    const [
      marginHtml,
      marginTs,
      paddingHtml,
      paddingTs,
      autoMarginHtml,
      autoMarginTs,
      gapHtml,
      gapTs,
    ] = await Promise.all([
      this.fetchSnippet('margin/margin.html'),
      this.fetchSnippet('margin/margin.ts'),
      this.fetchSnippet('padding/padding.html'),
      this.fetchSnippet('padding/padding.ts'),
      this.fetchSnippet('auto-margin/auto-margin.html'),
      this.fetchSnippet('auto-margin/auto-margin.ts'),
      this.fetchSnippet('gap/gap.html'),
      this.fetchSnippet('gap/gap.ts'),
    ]);

    this.marginSnippet.set({ html: marginHtml, ts: marginTs });
    this.paddingSnippet.set({ html: paddingHtml, ts: paddingTs });
    this.autoMarginSnippet.set({ html: autoMarginHtml, ts: autoMarginTs });
    this.gapSnippet.set({ html: gapHtml, ts: gapTs });
  }

  private async fetchSnippet(path: string): Promise<string> {
    try {
      return await firstValueFrom(
        this.http.get(`snippets/spacing/${path}`, { responseType: 'text' })
      );
    } catch {
      return `<!-- Gagal memuat snippet: ${path} -->`;
    }
  }
}
