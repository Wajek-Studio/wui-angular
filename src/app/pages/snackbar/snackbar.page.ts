import { Component, inject, OnInit, TemplateRef, viewChild } from "@angular/core";
import { WuiButton, WuiPage, WuiPageService, WuiSnackbarRef, WuiSnackbarService } from "@wajek/wui";

@Component({
    selector: 'app-snackbar-page',
    templateUrl: './snackbar.page.html',
    imports: [
        WuiPage,
        WuiButton
    ]
})
export class SnackbarPage implements OnInit {

    pageService = inject(WuiPageService);
    pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');
    
    snackbarService = inject(WuiSnackbarService);
    snackbarRef? : WuiSnackbarRef;

    simple() {
        this.snackbarRef = this.snackbarService.open('Data berhasil ditambahkan');
    }

    close() {
        if(this.snackbarRef == undefined) return;
        this.snackbarRef?.dismiss();
        this.snackbarRef = undefined;
    }

    ngOnInit() {
        this.pageService.replace(this.pageTpl());
    }

}