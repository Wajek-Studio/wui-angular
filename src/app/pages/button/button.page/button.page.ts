import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { WuiButton, WuiIcon, WuiPage, WuiPageService, WuiScrollbar, WuiContainer, WuiTable } from '@wajek/wui';
import { firstValueFrom } from 'rxjs';
import { ShowcaseComponent, ShowcaseTab } from '../../../shared/showcase';

export interface ButtonSnippet {
  html?: string;
  ts?: string;
}

@Component({
  selector: 'app-button.page',
  imports: [WuiButton, WuiIcon, WuiPage, ShowcaseComponent, WuiScrollbar, WuiContainer, WuiTable, ShowcaseComponent],
  templateUrl: './button.page.html',
  styleUrl: './button.page.scss',
})
export class ButtonPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  // Snippets
  readonly filledSnippet = signal<ButtonSnippet>({});
  readonly outlinedSnippet = signal<ButtonSnippet>({});
  readonly textSnippet = signal<ButtonSnippet>({});
  readonly iconsSnippet = signal<ButtonSnippet>({});
  readonly colorsSnippet = signal<ButtonSnippet>({});
  readonly linkSnippet = signal<ButtonSnippet>({});

  // Dynamic Tabs for ShowcaseComponent
  readonly filledTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.filledSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.filledSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly outlinedTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.outlinedSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.outlinedSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly textTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.textSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.textSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly iconsTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.iconsSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.iconsSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly colorsTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.colorsSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.colorsSnippet().ts ?? '', language: 'typescript' },
  ]);

  readonly linkTabs = computed<ShowcaseTab[]>(() => [
    { label: 'HTML', code: this.linkSnippet().html ?? '', language: 'html' },
    { label: 'TypeScript', code: this.linkSnippet().ts ?? '', language: 'typescript' },
  ]);

  async ngOnInit(): Promise<void> {
    this.pageService.replace(this.pageTpl()!);

    // Load snippet secara paralel dari public/snippets/button/
    const [filled, outlined, text, icons, colors, link] = await Promise.all([
      this.fetchSnippet('filled', 'filled'),
      this.fetchSnippet('outlined', 'outlined'),
      this.fetchSnippet('text', 'text'),
      this.fetchSnippet('icons', 'icons'),
      this.fetchSnippet('colors', 'colors'),
      this.fetchSnippet('link', 'link'),
    ]);

    this.filledSnippet.set(filled);
    this.outlinedSnippet.set(outlined);
    this.textSnippet.set(text);
    this.iconsSnippet.set(icons);
    this.colorsSnippet.set(colors);
    this.linkSnippet.set(link);
  }

  private async fetchSnippet(dir: string, file: string): Promise<ButtonSnippet> {
    try {
      const [html, ts] = await Promise.all([
        firstValueFrom(this.http.get(`snippets/button/${dir}/${file}.html`, { responseType: 'text' })).catch(() => ''),
        firstValueFrom(this.http.get(`snippets/button/${dir}/${file}.ts`, { responseType: 'text' })).catch(() => ''),
      ]);
      return { html, ts };
    } catch {
      return {};
    }
  }
}
