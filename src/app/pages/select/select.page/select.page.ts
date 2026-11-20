import { Component, OnInit, TemplateRef, inject, signal, viewChild } from '@angular/core';
import {
  WuiButton,
  WuiFormField,
  WuiIcon,
  WuiInput,
  WuiLabel,
  WuiOption,
  WuiPage,
  WuiPageService,
  WuiScrollbar,
  WuiSelect,
  WuiTable,
} from '@wajek/wui';
import { ShowcaseComponent } from '../../../shared/showcase';
import { SelectSimpleExample } from '../../../../examples/select-simple-example/select-simple-example';

/**
 * Halaman demo `<wui-select>`.
 *
 * Menggunakan ShowcaseComponent untuk menyajikan live preview interaktif beserta tab kode sumber HTML dan TypeScript.
 */
@Component({
  selector: 'app-select.page',
  imports: [
    WuiFormField,
    WuiIcon,
    WuiInput,
    WuiLabel,
    WuiOption,
    WuiPage,
    WuiScrollbar,
    WuiSelect,
    WuiTable,
    ShowcaseComponent,
    SelectSimpleExample
],
  templateUrl: './select.page.html',
})
export class SelectPage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  /** Nilai contoh yang bisa diisi/dikosongkan dari halaman — diisi opsi di tengah ('Bekasi'). */
  protected readonly kota = signal<unknown>('Bekasi');

  /** Field kedua dengan nilai awal, supaya keadaan "sudah terisi" bisa dibandingkan. */
  protected readonly negara = signal<unknown>('Indonesia');

  /** Nilai select pada bagian "desain opsi sendiri" — opsinya bervalue eksplisit. */
  protected readonly kotaKaya = signal<unknown>(null);

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!);
  }

  protected isi(): void {
    this.kota.set('Bandung');
  }

  protected kosongkan(): void {
    this.kota.set('');
  }
}
