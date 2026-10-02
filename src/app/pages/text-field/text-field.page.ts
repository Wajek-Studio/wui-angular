import { Component, inject, OnInit, TemplateRef, viewChild } from "@angular/core";
import { WuiPageService, WuiPage } from "@wajek/wui";
import { ShowcaseComponent } from "../../shared/showcase";
import { TextFieldExample } from "../../../examples/text-field/text-field.example";
import { TextFieldPasswordExample } from "../../../examples/text-field/text-field-password.example";
import { TextFieldNumericExample } from "../../../examples/text-field/text-field-numeric.example";
import { TextFieldDateExample } from "../../../examples/text-field/text-field-date.example";
import { TextFieldTextareaExample } from "../../../examples/text-field/text-field-textarea.example";

@Component({
    selector: 'app-text-field',
    templateUrl: './text-field.page.html',
    imports: [WuiPage, ShowcaseComponent, TextFieldExample, TextFieldPasswordExample, TextFieldNumericExample, TextFieldDateExample, TextFieldTextareaExample]
})
export class TextFieldPage implements OnInit {

    pageService = inject(WuiPageService);
    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');

    ngOnInit(): void {
        this.pageService.replace(this.pageTpl());
    }

}