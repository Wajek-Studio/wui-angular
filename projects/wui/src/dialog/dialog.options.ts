import { InjectionToken, Injector, inject } from '@angular/core';
import type { SafeHtml } from '@angular/platform-browser';

import { WuiButtonColor, WuiButtonVariant } from '../button/button.options';

/**
 * Peran ARIA elemen dialog.
 *
 * - `dialog` (default) — dialog biasa. ESC dan klik backdrop menutup.
 * - `alertdialog` — dialog sistem (konfirmasi/peringatan) yang wajib dijawab lewat tombol,
 *   biasanya tanpa `disableClose`. **Belum dipakai di v1**; disiapkan karena CDK hanya
 *   meneruskan nilainya ke atribut `role` — menambah alert nanti tidak mengubah arsitektur.
 */
export type WuiDialogRole = 'dialog' | 'alertdialog';

/**
 * Ke mana fokus dipindahkan saat dialog terbuka.
 *
 * - `first-tabbable` (default) — elemen pertama yang bisa di-tab.
 * - `first-heading` — heading pertama (`h1`–`h6` atau `[role="heading"]`).
 * - `dialog` — wadah dialognya sendiri.
 * - `false` — tidak dipindahkan; komponen dialog mengatur fokusnya sendiri.
 * - `string` — selector CSS bebas.
 */
export type WuiDialogAutoFocus = 'dialog' | 'first-tabbable' | 'first-heading' | false | string;

/**
 * Opsi untuk `WuiDialogService.open()` dan `openTemplate()`.
 *
 * Nama propertinya sengaja mengikuti `DialogConfig` milik CDK supaya mudah dicocokkan dengan
 * dokumentasi di atasnya, tapi **yang tersedia hanya yang terdaftar di sini** —
 * `positionStrategy`, `scrollStrategy`, dan `container` belum dibuka di v1.
 *
 * Semua properti opsional: yang tidak diisi memakai default CDK (kecuali `panelClass`,
 * `backdropClass`, dan `ariaModal` — lihat `WuiDialogService`).
 */
export interface WuiDialogOptions<D = unknown> {
  /**
   * Data yang dikirim ke dialog.
   *
   * Di komponen dialog dibaca lewat `inject(WUI_DIALOG_DATA)` atau `injectDialogData<T>()`;
   * di mode `<ng-template>` tersedia sebagai `let-data`.
   */
  data?: D;

  /** Id dialog. Dibuat otomatis kalau kosong. Wajib unik — id yang sudah dipakai akan error. */
  id?: string;

  /** Peran ARIA. Default `'dialog'`. */
  role?: WuiDialogRole;

  /**
   * Class **tambahan** untuk panel dialog. `.wui-dialog` (permukaan bawaan) selalu ikut
   * terpasang, jadi latar/radius/padding dialog tidak bisa hilang karena salah isi di sini.
   */
  panelClass?: string | string[];

  /** Class backdrop. Default `'wui-dialog__backdrop'` (dim dari token `--wui-overlay-color`). */
  backdropClass?: string;

  /** Ada backdrop atau tidak. Default `true`. */
  hasBackdrop?: boolean;

  /** `true` membuat ESC & klik backdrop tidak menutup dialog. Default `false`. */
  disableClose?: boolean;

  /** Label dialog untuk screen reader (`aria-label`). */
  ariaLabel?: string;

  /** Id elemen yang menjadi label dialog (`aria-labelledby`). */
  ariaLabelledBy?: string;

  /** Id elemen yang menjelaskan dialog (`aria-describedby`). */
  ariaDescribedBy?: string;

  /** Fokus awal. Default `'first-tabbable'`. */
  autoFocus?: WuiDialogAutoFocus;

  /**
   * Kembalikan fokus ke elemen sebelum dialog dibuka. Default `true`.
   * Bisa diarahkan ke selector CSS atau elemen tertentu.
   */
  restoreFocus?: boolean | string | HTMLElement;

  /** Ukuran panel. Nilai CSS apa pun (`'40rem'`, `'90vw'`). */
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;

  /**
   * Injector tambahan dari pemanggil.
   *
   * Dipakai sebagai **induk** injector internal wui (yang menyediakan `WuiDialogRef` dan
   * `WUI_DIALOG_DATA`), jadi provider dari pemanggil tetap bisa di-inject oleh dialog.
   */
  injector?: Injector;
}

/**
 * Data dialog (`options.data`).
 *
 * ```ts
 * export class KonfirmasiHapus {
 *   protected readonly data = injectDialogData<{ nama: string }>();
 * }
 * ```
 */
export const WUI_DIALOG_DATA = new InjectionToken<unknown>('[wui] Data dialog');

/**
 * Versi bertipe dari `WUI_DIALOG_DATA` — casting-nya cukup di satu tempat ini.
 *
 * Hanya boleh dipanggil dari dalam konteks injeksi (komponen/directive yang dirender
 * sebagai isi dialog).
 */
export function injectDialogData<T>(): T {
  return inject(WUI_DIALOG_DATA) as T;
}

/**
 * Satu tombol di dialog sistem (`WuiDialogService.alert()`).
 *
 * Dipakai kalau tombolnya perlu tampil berbeda. Tombol biasa cukup ditulis sebagai `string`.
 */
export interface WuiAlertButton {
  /** Teks tombol. */
  label: string;

  /** Bentuk tombol. String biasa memakai `'text'`. */
  variant?: WuiButtonVariant;

  /** Peran warna tombol. String biasa memakai `'default'`. */
  color?: WuiButtonColor;
}

/**
 * Opsi `WuiDialogService.alert()` — dialog sistem siap pakai.
 *
 * Dipakai untuk pesan yang tidak butuh tata letak sendiri: error dari API, konfirmasi singkat,
 * pemberitahuan. Isinya datang sebagai **data**, jadi aplikasi tidak perlu menulis komponen atau
 * `<ng-template>` baru untuk setiap pesan.
 *
 * ```ts
 * const aksi = await this.dialogs.alert({
 *   title: 'Gagal menyimpan kontak',
 *   content: 'Server menolak permintaan.<br><code>HTTP 500</code>',
 *   buttons: ['Tutup', { label: 'Coba lagi', variant: 'filled', color: 'primary' }],
 * });
 * // aksi: 0 = 'Tutup', 1 = 'Coba lagi', null = ditutup lewat ESC/backdrop
 * ```
 */
export interface WuiAlertOptions {
  /** Judul dialog. Dipakai juga sebagai label ARIA dialog. */
  title: string;

  /**
   * Isi dialog. Boleh HTML.
   *
   * `string` **disanitasi Angular** secara otomatis (tag & atribut berbahaya dibuang) — aman untuk
   * teks yang datang dari API. Kalau memang perlu HTML tepercaya yang utuh, kirim `SafeHtml` dari
   * `DomSanitizer.bypassSecurityTrustHtml()` — hanya untuk konten yang Anda susun sendiri.
   *
   * Baris baru (`\n`) tetap dihormati, jadi teks biasa tidak perlu diubah jadi HTML.
   */
  content?: string | SafeHtml;

  /**
   * Daftar tombol, urut kiri ke kanan. Hasil `alert()` adalah **index** tombol yang ditekan.
   *
   * - `string` — tombol biasa (bentuk `text`, warna netral).
   * - `WuiAlertButton` — kalau perlu `variant`/`color` berbeda, mis. aksi destruktif.
   *
   * Default `['OK']` bila tidak diisi.
   */
  buttons?: readonly (string | WuiAlertButton)[];

  /**
   * Boleh ditutup lewat ESC / klik backdrop (hasilnya `null`). Default `true`.
   * Isi `false` untuk dialog yang **wajib** dijawab lewat tombol.
   */
  dismissible?: boolean;

  /** Id dialog. Dibuat otomatis kalau kosong. */
  id?: string;

  /** Class tambahan untuk panel — `.wui-dialog` dan `.wui-dialog--alert` selalu terpasang. */
  panelClass?: string | string[];
}
