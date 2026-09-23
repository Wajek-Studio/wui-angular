import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { WuiButton, WuiDialogRef, WuiDialogService } from '@wajek/wui';

@Component({
  selector: 'app-dialog-template-demo',
  imports: [WuiButton],
  templateUrl: './from-template.html',
})
export class DialogTemplateDemoComponent {
  private readonly dialogs = inject(WuiDialogService);

  readonly tplDialog = viewChild.required<TemplateRef<{ nama: string }>>('tplDialog');
  private templateRef?: WuiDialogRef<string>;

  hasilTemplate = '(belum dibuka)';

  bukaTemplate(): void {
    this.templateRef = this.dialogs.openTemplate<string, { nama: string }>(this.tplDialog(), {
      data: { nama: 'Produk B' },
      ariaLabelledBy: 'demo-template-title',
    });

    void this.templateRef.result.then((hasil) => {
      this.hasilTemplate = hasil ?? 'ditutup tanpa pilihan';
    });
  }

  tutupTemplate(nilai: string): void {
    this.templateRef?.close(nilai);
  }
}
