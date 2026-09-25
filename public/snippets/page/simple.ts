import { Component, inject, viewChild, TemplateRef } from '@angular/core';
import { WuiButton, WuiPage, WuiPageHost, WuiPageService } from '@wajek/wui';

@Component({
    imports: [WuiButton, WuiPage, WuiPageHost],
    selector: 'app',
    styles: `
        .page-host {
            width: 320px;
            height: 320px;
        }
    `,
    template: `
        <button wuiButton (click)="openPage()">Open Page</button>
        <div class="page-host" wuiPageHost></div>
        <ng-template #pageTpl>
            <wui-page></wui-page>
        </ng-template>
    `
})
export class App {

    pageService = inject(WuiPageService);
    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');

    openPage() {
        this.pageService.replace(this.pageTpl());
    }

}