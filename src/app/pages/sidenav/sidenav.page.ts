import { Component, inject, OnInit, TemplateRef, viewChild } from "@angular/core";
import { WuiPage, WuiPageService, WuiScrollbar } from "@wajek/wui";
import { ShowcaseComponent } from "../../shared/showcase";
import { SidenavExample } from "../../../examples/sidenav-example/sidenav.example";

@Component({
    selector: 'app-sidenav-page',
    templateUrl: './sidenav.page.html',
    imports: [WuiPage, WuiScrollbar, ShowcaseComponent, SidenavExample]
})
export class SidenavPage implements OnInit {

    pageService = inject(WuiPageService);
    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');

    ngOnInit(): void {
        this.pageService.replace(this.pageTpl());
    }

}