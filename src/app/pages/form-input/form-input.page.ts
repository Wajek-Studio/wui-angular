import { Component, inject, OnInit, TemplateRef, viewChild } from "@angular/core";
import { WuiPageService, WuiPage } from "@wajek/wui";
import { ShowcaseComponent } from "../../shared/showcase";
import { FormInputExample } from "../../../examples/form-input-example/form-input.example";

@Component({
    selector: 'app-form-input',
    templateUrl: './form-input.page.html',
    imports: [WuiPage, ShowcaseComponent, FormInputExample]
})
export class FormInputPage implements OnInit {

    pageService = inject(WuiPageService);
    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');
    
    ngOnInit(): void {
        this.pageService.replace(this.pageTpl());
    }

}