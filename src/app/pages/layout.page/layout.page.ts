import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiPage, WuiPageService } from '@wajek/wui';
import { Highlight } from 'ngx-highlightjs';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-layout.page',
  imports: [RouterLink, WuiPage, Highlight],
  templateUrl: './layout.page.html',
  styleUrl: './layout.page.scss',
})
export class LayoutPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  // Snippets loaded from public/snippets/layout/
  readonly containerSnippet = signal<string>('');
  readonly gridBasicSnippet = signal<string>('');
  readonly gridResponsiveSnippet = signal<string>('');
  readonly gridGapSnippet = signal<string>('');
  readonly flexJustifySnippet = signal<string>('');
  readonly flexAlignSnippet = signal<string>('');
  readonly flexResponsiveSnippet = signal<string>('');
  readonly patternsSnippet = signal<string>('');

  async ngOnInit(): Promise<void> {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });

    // Load all snippets in parallel from public/snippets/layout/
    const [
      container,
      gridBasic,
      gridResponsive,
      gridGap,
      flexJustify,
      flexAlign,
      flexResponsive,
      patterns,
    ] = await Promise.all([
      this.fetchSnippet('container', 'container'),
      this.fetchSnippet('grid-basic', 'grid-basic'),
      this.fetchSnippet('grid-responsive', 'grid-responsive'),
      this.fetchSnippet('grid-gap', 'grid-gap'),
      this.fetchSnippet('flex-justify', 'flex-justify'),
      this.fetchSnippet('flex-align', 'flex-align'),
      this.fetchSnippet('flex-responsive', 'flex-responsive'),
      this.fetchSnippet('patterns', 'patterns'),
    ]);

    this.containerSnippet.set(container);
    this.gridBasicSnippet.set(gridBasic);
    this.gridResponsiveSnippet.set(gridResponsive);
    this.gridGapSnippet.set(gridGap);
    this.flexJustifySnippet.set(flexJustify);
    this.flexAlignSnippet.set(flexAlign);
    this.flexResponsiveSnippet.set(flexResponsive);
    this.patternsSnippet.set(patterns);
  }

  private async fetchSnippet(dir: string, file: string): Promise<string> {
    try {
      return await firstValueFrom(
        this.http.get(`snippets/layout/${dir}/${file}.html`, { responseType: 'text' }),
      );
    } catch {
      return '<!-- Gagal memuat snippet layout. -->';
    }
  }
}
