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
  WuiSelect,
} from '@wajek/wui';

/**
 * Halaman demo `<wui-select>`.
 *
 * Fase **F1**: masih trigger saja — belum ada panel pilihan, jadi yang diperagakan di sini adalah
 * bagian "field"-nya (bentuk kotak, label mengapung, varian, keadaan nonaktif, hint/error) dan
 * kepatuhan ARIA-nya. Panel + navigasi keyboard menyusul di F2, CVA (`formControlName`) di F3 —
 * lihat `docs/planning/wui-select-plan.md` §7.
 */
@Component({
  selector: 'app-select.page',
  imports: [WuiButton, WuiFormField, WuiIcon, WuiInput, WuiLabel, WuiOption, WuiPage, WuiSelect],
  templateUrl: './select.page.html',
})
export class SelectPage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  /** Nilai contoh yang bisa diisi/dikosongkan dari halaman — untuk melihat label mengapung. */
  protected readonly kota = signal<unknown>(null);

  /** Field kedua dengan nilai awal, supaya keadaan "sudah terisi" bisa dibandingkan. */
  protected readonly negara = signal<unknown>('Indonesia');

  /** Nilai select pada bagian "desain opsi sendiri" — opsinya bervalue eksplisit. */
  protected readonly kotaKaya = signal<unknown>(null);

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });
  }

  protected isi(): void {
    this.kota.set('Bandung');
  }

  protected kosongkan(): void {
    this.kota.set('');
  }
}
