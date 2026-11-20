import { Component, inject, OnInit, TemplateRef, viewChild } from "@angular/core";
import { WuiPage, WuiPageService, WuiScrollbar } from "@wajek/wui";
import { ShowcaseComponent } from "../../shared/showcase";
import { MessageSimpleExample } from "../../../examples/message-simple-example/message-simple-example";

@Component({
    selector: 'app-message-page',
    templateUrl: './message.page.html',
    imports: [WuiPage, WuiScrollbar, ShowcaseComponent, MessageSimpleExample]
})
export class MessagePage implements OnInit {

    pageService = inject(WuiPageService);
    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');

    ngOnInit(): void {
        this.pageService.replace(this.pageTpl());
    }

}