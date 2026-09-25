import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiButton, WuiPage, WuiPageContent, WuiPageService, WuiScrollbar } from '@wajek/wui';
import { firstValueFrom } from 'rxjs';
import { ShowcaseComponent, ShowcaseTab } from '../../shared/showcase';

export interface FlexSnippet {
  html?: string;
  ts?: string;
}

@Component({
  selector: 'app-flex.page',
  imports: [RouterLink, WuiPage, WuiPageContent, WuiScrollbar, WuiButton, ShowcaseComponent],
  templateUrl: './flex.page.html',
  styleUrl: './flex.page.scss',
})
export class FlexPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  // Snippets
  readonly directionSnippet = signal<FlexSnippet>({});
  readonly justifySnippet = signal<FlexSnippet>({});
  readonly alignSnippet = signal<FlexSnippet>({});
  readonly fillSnippet = signal<FlexSnippet>({});
  readonly responsiveSnippet = signal<FlexSnippet>({});

  // Tabs
  readonly directionTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.directionSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.directionSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly justifyTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.justifySnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.justifySnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly alignTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.alignSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.alignSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly fillTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.fillSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.fillSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly responsiveTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.responsiveSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.responsiveSnippet().ts ?? '', language: 'typescript' },
  ]);

  async ngOnInit(): Promise<void> {
    this.pageService.replace(this.pageTpl()!);

    const [
      directionHtml,
      directionTs,
      justifyHtml,
      justifyTs,
      alignHtml,
      alignTs,
      fillHtml,
      fillTs,
      responsiveHtml,
      responsiveTs,
    ] = await Promise.all([
      this.fetchSnippet('direction/direction.html'),
      this.fetchSnippet('direction/direction.ts'),
      this.fetchSnippet('justify/justify.html'),
      this.fetchSnippet('justify/justify.ts'),
      this.fetchSnippet('align/align.html'),
      this.fetchSnippet('align/align.ts'),
      this.fetchSnippet('fill/fill.html'),
      this.fetchSnippet('fill/fill.ts'),
      this.fetchSnippet('responsive/responsive.html'),
      this.fetchSnippet('responsive/responsive.ts'),
    ]);

    this.directionSnippet.set({ html: directionHtml, ts: directionTs });
    this.justifySnippet.set({ html: justifyHtml, ts: justifyTs });
    this.alignSnippet.set({ html: alignHtml, ts: alignTs });
    this.fillSnippet.set({ html: fillHtml, ts: fillTs });
    this.responsiveSnippet.set({ html: responsiveHtml, ts: responsiveTs });
  }

  private async fetchSnippet(path: string): Promise<string> {
    try {
      return await firstValueFrom(
        this.http.get(`snippets/flex/${path}`, { responseType: 'text' })
      );
    } catch {
      return `<!-- Gagal memuat snippet: ${path} -->`;
    }
  }
}
