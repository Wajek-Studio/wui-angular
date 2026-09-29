import { Component, inject, OnInit, TemplateRef, viewChild } from "@angular/core";
import { WuiPage, WuiPageService, WuiScrollbar } from "@wajek/wui";
import { ShowcaseComponent } from "../../shared/showcase";
import { MenuSimpleExample } from "../../../examples/menu-simple-example/menu-simple-example";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.page.html',
    imports: [WuiPage, ShowcaseComponent, MenuSimpleExample, WuiScrollbar]
})
export class AppMenuPage implements OnInit {
    pageService = inject(WuiPageService);
    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');

    ngOnInit() {
        this.pageService.replace(this.pageTpl());
    }
}