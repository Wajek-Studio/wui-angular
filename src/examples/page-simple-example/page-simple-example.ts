import { Component, inject, TemplateRef, viewChild } from "@angular/core";
import { WuiButton, WuiPage, WuiPageContent, WuiPageHost, WuiPageRef, WuiPageService } from "@wajek/wui";

@Component({
    imports: [
        WuiButton,
        WuiPage,
        WuiPageHost,
        WuiPageContent
    ],
    selector: 'page-simple-example',
    templateUrl: './page-simple-example.html',
    styleUrl: './page-simple-example.scss'
})
export class PageSimpleExample {

    pageService = inject(WuiPageService);
    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');
    nestedPageTpl = viewChild.required<TemplateRef<any>>('nestedPageTpl');
    nestedPageRef?: WuiPageRef;

    reset() {
        this.pageService.closeAll('simple-page-host');
        this.nestedPageRef = undefined;
    }
    
    replace() {
        this.pageService.replace(this.pageTpl(), 'simple-page-host');
    }

    open() {
        this.nestedPageRef = this.pageService.open(this.nestedPageTpl(), 'simple-page-host');
    }

    close() {
        this.nestedPageRef?.close();
        this.nestedPageRef = undefined;
    }

}