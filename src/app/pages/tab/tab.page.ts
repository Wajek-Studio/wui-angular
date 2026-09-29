import { Component, inject, OnInit, TemplateRef, viewChild } from "@angular/core";
import { WuiPage, WuiPageService } from "@wajek/wui";
import { ShowcaseComponent } from "../../shared/showcase";
import { TabSimpleExample } from "../../../examples/tab-simple-example/tab-simple-example";

@Component({
    selector: 'app-tabs',
    templateUrl: './tab.page.html',
    imports: [WuiPage, ShowcaseComponent, TabSimpleExample]
})
export class TabPage implements OnInit {
    pageService = inject(WuiPageService);
    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');

    ngOnInit(): void {
        this.pageService.replace(this.pageTpl());
    }
}