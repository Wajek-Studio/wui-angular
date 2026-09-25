import { HttpClient } from "@angular/common/http";
import { Component, computed, inject, OnInit, signal, TemplateRef, viewChild } from "@angular/core";
import { WuiPage, WuiPageContent, WuiPageService, WuiContainer, WuiButton, WuiPageHost, WuiPageRef, WuiTable, WuiScrollbar } from "@wajek/wui";
import { firstValueFrom } from "rxjs";
import { ShowcaseTab } from "../../shared/showcase";
import { ShowcaseComponent } from "../../shared/showcase/showcase.component";

export interface PageSnippet {
  html?: string;
  ts?: string;
}

@Component({
    selector: 'app-page-page',
    templateUrl: './page.page.html',
    styleUrl: './page.page.scss',
    imports: [WuiPage, WuiPageContent, WuiContainer, WuiButton, WuiPageHost, ShowcaseComponent, WuiTable, WuiScrollbar]
})
export class PagePage implements OnInit {

    private readonly http = inject(HttpClient);
    readonly pageService = inject(WuiPageService);

    readonly pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');

    // ─── Seksi 1: Default Page ───────────────────────────────────────────────
    readonly defaultSnippet = signal<PageSnippet>({});
    readonly defaultTabs = computed<ShowcaseTab[]>(() => [
        { label: 'HTML', code: this.defaultSnippet().html ?? '', language: 'html' },
        { label: 'TypeScript', code: this.defaultSnippet().ts ?? '', language: 'typescript' },
    ]);
    readonly defaultPageTpl = viewChild.required<TemplateRef<any>>('defaultPageTpl');

    openDefaultPage() {
        this.pageService.replace(this.defaultPageTpl(), 'default-demo');
    }

    // ─── Seksi 2: Nested Page ────────────────────────────────────────────────
    readonly nestedSnippet = signal<PageSnippet>({});
    readonly nestedTabs = computed<ShowcaseTab[]>(() => [
        { label: 'HTML', code: this.nestedSnippet().html ?? '', language: 'html' },
        { label: 'TypeScript', code: this.nestedSnippet().ts ?? '', language: 'typescript' },
    ]);
    readonly mainPageTpl   = viewChild.required<TemplateRef<any>>('mainPageTpl');
    readonly subPageTpl    = viewChild.required<TemplateRef<any>>('subPageTpl');
    subPageRef: WuiPageRef | null = null;

    openMainPage() {
        this.pageService.replace(this.mainPageTpl(), 'nested-demo');
    }

    openSubPage() {
        this.subPageRef = this.pageService.open(this.subPageTpl(), 'nested-demo');
    }

    closeSubPage() {
        this.subPageRef?.close();
    }

    // ─── Seksi 3: Multi-Host ─────────────────────────────────────────────────
    readonly multiHostSnippet = signal<PageSnippet>({});
    readonly multiHostTabs = computed<ShowcaseTab[]>(() => [
        { label: 'HTML', code: this.multiHostSnippet().html ?? '', language: 'html' },
        { label: 'TypeScript', code: this.multiHostSnippet().ts ?? '', language: 'typescript' },
    ]);
    readonly hostATpl = viewChild.required<TemplateRef<any>>('hostATpl');
    readonly hostBTpl = viewChild.required<TemplateRef<any>>('hostBTpl');

    hostARef: WuiPageRef | null = null;
    hostBRef: WuiPageRef | null = null;

    openHostA() {
        this.hostARef = this.pageService.replace(this.hostATpl(), 'host-a');
    }

    closeHostA() {
        this.hostARef?.close();
    }

    openHostB() {
        this.hostBRef = this.pageService.replace(this.hostBTpl(), 'host-b');
    }

    closeHostB() {
        this.hostBRef?.close();
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────
    async ngOnInit(): Promise<void> {
        this.pageService.replace(this.pageTpl());

        const [def, nested, multi] = await Promise.all([
            this.loadSnippet('page/default/default'),
            this.loadSnippet('page/nested/nested'),
            this.loadSnippet('page/multi-host/multi-host'),
        ]);

        this.defaultSnippet.set(def);
        this.nestedSnippet.set(nested);
        this.multiHostSnippet.set(multi);
    }

    private async loadSnippet(path: string): Promise<PageSnippet> {
        try {
            const [html, ts] = await Promise.all([
                firstValueFrom(this.http.get(`snippets/${path}.html`, { responseType: 'text' })).catch(() => ''),
                firstValueFrom(this.http.get(`snippets/${path}.ts`, { responseType: 'text' })).catch(() => ''),
            ]);
            return { html, ts };
        } catch {
            return {};
        }
    }
}