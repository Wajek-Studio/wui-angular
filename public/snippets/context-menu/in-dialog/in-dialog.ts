import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import {
  WuiButton,
  WuiContextMenuTrigger,
  WuiDialogService,
  WuiMenu,
  WuiMenuItem,
} from '@wajek/wui';

@Component({
  selector: 'app-context-menu-dialog-demo',
  imports: [WuiButton, WuiContextMenuTrigger, WuiMenu, WuiMenuItem],
  templateUrl: './in-dialog.html',
})
export class ContextMenuDialogDemoComponent {
  private readonly dialogs = inject(WuiDialogService);

  readonly dialogTpl = viewChild.required<TemplateRef<unknown>>('dialog');

  bukaDialog(): void {
    this.dialogs.openTemplate(this.dialogTpl(), {});
  }

  aksi(nama: string): void {
    console.log('Aksi dialog:', nama);
  }
}
