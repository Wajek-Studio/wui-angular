import { Component, inject, OnInit, TemplateRef, viewChild } from "@angular/core";
import { WuiContainer, WuiPage, WuiPageContent, WuiPageService, WuiScrollbar, WuiTable } from "@wajek/wui";
import { PageSimpleExample } from "../../../examples/page-simple-example/page-simple-example";
import { ShowcaseComponent } from "../../shared/showcase/showcase.component";

@Component({
    selector: 'app-page-page',
    templateUrl: './page.page.html',
    styleUrl: './page.page.scss',
    imports: [WuiPage, WuiPageContent, WuiContainer, ShowcaseComponent, WuiTable, WuiScrollbar, PageSimpleExample]
})
export class PagePage implements OnInit {
    
    pageService = inject(WuiPageService);
    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');

    ngOnInit(): void {
        this.pageService.replace(this.pageTpl());
    }

}