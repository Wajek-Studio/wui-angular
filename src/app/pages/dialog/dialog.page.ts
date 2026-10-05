import { Component, inject, OnInit, TemplateRef, viewChild } from "@angular/core";
import { WuiPageService, WuiPage } from "@wajek/wui";
import { ShowcaseComponent } from "../../shared/showcase";
import { DialogSimpleExample } from "../../../examples/dialog-simple-example/dialog-simple.example";
import { DialogSystemExample } from "../../../examples/dialog-system-example/dialog-system.example";
import { DialogFormExample } from "../../../examples/dialog-form-example/dialog-form.example";
import { DialogLoadingExample } from "../../../examples/dialog-loading-example/dialog-loading.example";

@Component({
  selector: 'app-dialog-page',
  templateUrl: './dialog.page.html',
  imports: [WuiPage, ShowcaseComponent, DialogSimpleExample, DialogSystemExample, DialogFormExample, DialogLoadingExample]
})
export class DialogPage implements OnInit {

  pageService = inject(WuiPageService);
  pageTpl = viewChild.required<TemplateRef<any>>('pageTpl');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl());
  }

}