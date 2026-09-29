import { Component, inject, OnDestroy, OnInit, TemplateRef, viewChild } from "@angular/core";
import { WuiPageService, WuiPage, WuiPageRef } from "@wajek/wui";

@Component({
    selector: 'app-page-nested-page',
    template: `
    <ng-template #pageTpl>
        <wui-page>
            <div class="wui-page-content">Child Page</div>
        </wui-page>
    </ng-template>
    `,
    imports: [WuiPage]
})
export class PageNestedPage implements OnInit, OnDestroy {

    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');
    pageService = inject(WuiPageService);
    pageRef?: WuiPageRef;

    ngOnInit(): void {
        this.pageRef = this.pageService.open(this.pageTpl());
    }

    ngOnDestroy() {
        this.pageRef?.close();
    }

}