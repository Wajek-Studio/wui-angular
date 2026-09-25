import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiPage, WuiPageContent, WuiPageService, WuiScrollbar } from '@wajek/wui';
import { firstValueFrom } from 'rxjs';
import { ShowcaseComponent, ShowcaseTab } from '../../shared/showcase';

export interface GridSnippet {
  html?: string;
  ts?: string;
}

@Component({
  selector: 'app-grid.page',
  imports: [RouterLink, WuiPage, WuiPageContent, WuiScrollbar, ShowcaseComponent],
  templateUrl: './grid.page.html',
  styleUrl: './grid.page.scss',
})
export class GridPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  // Snippets signals
  readonly containerSnippet = signal<GridSnippet>({});
  readonly basicSnippet = signal<GridSnippet>({});
  readonly responsiveSnippet = signal<GridSnippet>({});
  readonly gapSnippet = signal<GridSnippet>({});

  // Computed tabs for showcases
  readonly containerTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.containerSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.containerSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly basicTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.basicSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.basicSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly responsiveTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.responsiveSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.responsiveSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly gapTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.gapSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.gapSnippet().ts ?? '', language: 'typescript' },
  ]);

  async ngOnInit(): Promise<void> {
    this.pageService.replace(this.pageTpl()!);

    const [containerHtml, containerTs, basicHtml, basicTs, responsiveHtml, responsiveTs, gapHtml, gapTs] =
      await Promise.all([
        this.fetchSnippet('container/container.html'),
        this.fetchSnippet('container/container.ts'),
        this.fetchSnippet('basic/basic.html'),
        this.fetchSnippet('basic/basic.ts'),
        this.fetchSnippet('responsive/responsive.html'),
        this.fetchSnippet('responsive/responsive.ts'),
        this.fetchSnippet('gap/gap.html'),
        this.fetchSnippet('gap/gap.ts'),
      ]);

    this.containerSnippet.set({ html: containerHtml, ts: containerTs });
    this.basicSnippet.set({ html: basicHtml, ts: basicTs });
    this.responsiveSnippet.set({ html: responsiveHtml, ts: responsiveTs });
    this.gapSnippet.set({ html: gapHtml, ts: gapTs });
  }

  private async fetchSnippet(path: string): Promise<string> {
    try {
      return await firstValueFrom(
        this.http.get(`snippets/grid/${path}`, { responseType: 'text' })
      );
    } catch {
      return `<!-- Gagal memuat snippet: ${path} -->`;
    }
  }
}
