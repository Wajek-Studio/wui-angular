import { Component, inject, OnInit, TemplateRef, viewChild } from "@angular/core";
import { WuiPage, WuiPageContent, WuiPageService, WuiContainer, WuiButton, WuiPageHost } from "@wajek/wui";

@Component({
    selector: 'app-page-page',
    templateUrl: './page.page.html',
    styleUrl: './page.page.scss',
    imports: [WuiPage, WuiPageContent, WuiContainer, WuiButton, WuiPageHost]
})
export class PagePage implements OnInit {

    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');
    pageService = inject(WuiPageService);

    pageDemoTpl = viewChild.required<TemplateRef<any>>('pageDemoTpl');
    pageDemoNestedTpl = viewChild.required<TemplateRef<any>>('pageDemoNestedTpl');

    openDemoPage() {
        this.pageService.replace(this.pageDemoTpl(), 'demo');
    }

    openNestedPage() {
        this.pageService.open(this.pageDemoNestedTpl(), 'demo');
    }

    ngOnInit(): void {
        this.pageService.replace(this.pageTpl());
    }

}