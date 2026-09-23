import { Component, inject, OnInit, signal, TemplateRef, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { WuiPage, WuiPageService, WuiRadioButton, WuiRadioGroup } from "@wajek/wui";

@Component({
    imports: [
        FormsModule,
        WuiPage,
        WuiRadioGroup,
        WuiRadioButton
    ],
    selector: 'app-radio-page',
    templateUrl: './radio.page.html',
    styleUrl: './radio.page.scss'
})
export class RadioPage implements OnInit {

    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');
    pageService = inject(WuiPageService);

    selected = signal('option-1');

    ngOnInit(): void {
        this.pageService.replace(this.pageTpl());
    }

}