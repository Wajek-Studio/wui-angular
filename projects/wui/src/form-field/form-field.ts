import { Component, Signal, computed, input, signal } from '@angular/core';

/** @internal Penomoran id field. */
let nomorUrut = 0;

/**
 * Varian tampilan form field.
 *
 * - `outlined` (default) — kotak bergaris penuh; label yang mengapung duduk **di garis atasnya**.
 * - `filled` — latar terisi dengan garis bawah; label mengapung **di dalam** kotak.
 */
export type WuiFormFieldVariant = 'outlined' | 'filled';

/**
 * Wadah kontrol form: label mengapung, kontrolnya, dan pesan hint/error.
 *
 * ```html
 * <wui-form-field hint="Kami tidak akan mengirim spam.">
 *   <label wuiLabel>Email</label>
 *   <input wuiInput type="email" formControlName="email" />
 * </wui-form-field>
 * ```
 *
 * Label ditulis aplikasi sebagai `<label>` asli yang diberi directive `wuiLabel` (sama seperti
 * `[wuiButton]`/`[wuiInput]`), bukan lewat input `label` di sini. Labelnya **mengapung** saat
 * kontrol difokus atau sudah berisi, seperti Material: tetap satu elemen, jadi klik label tetap
 * memfokuskan kontrolnya (perilaku bawaan browser), tanpa JS yang menyalin posisi atau menambah
 * `<span>`.
 *
 * Yang diurus field ini adalah **hubungan antara label dan kontrolnya**, bukan perilaku kontrol:
 * - `for` pada label selalu menunjuk id kontrol yang benar (id dibuat otomatis kalau tidak diisi,
 *   dan id yang sudah ditulis aplikasi di kontrol tetap dipakai apa adanya).
 * - Pesan hint/error diberi id dan ditautkan ke kontrol lewat `aria-describedby` — dikerjakan
 *   `WuiInput`, jadi aplikasi tidak perlu menulis atribut ARIA sendiri.
 * - Saat `error` terisi, pesannya **menggantikan** `hint` dan kontrol ditandai `aria-invalid`.
 *
 * Field tidak menyimpan nilai dan tidak tahu-menahu soal `FormControl` — itu tetap urusan form
 * milik aplikasi (lihat `docs/planning/wui-form-controls-plan.md`, keputusan K1 & K6).
 */
@Component({
  selector: 'wui-form-field',
  templateUrl: './form-field.html',
  host: {
    // Class dasar WAJIB ada di host: seluruh style `.wui-form-field` (termasuk `position: relative`
    // yang jadi acuan label mengapung) menggantung padanya — bukan pada nama elemen.
    class: 'wui-form-field',
    '[class.wui-form-field--outlined]': "variant() === 'outlined'",
    '[class.wui-form-field--filled]': "variant() === 'filled'",
  },
})
export class WuiFormField {
  /** Varian tampilan. Default `'outlined'`. */
  readonly variant = input<WuiFormFieldVariant>('outlined');

  /** Teks label. Kosong berarti label tidak dirender. */
//   readonly label = input('');

  /** Petunjuk pengisian (netral). Tidak tampil saat `error` terisi. */
  readonly hint = input('');

  /**
   * Pesan kesalahan/validasi. Mengisi properti ini berarti kontrol dianggap tidak valid:
   * pesannya menggantikan `hint`, warnanya memakai peran `error`, dan kontrol ditandai
   * `aria-invalid="true"`.
   *
   * Teks disediakan aplikasi (tidak ada i18n di library) — mis.
   * `[error]="kontrol.touched && kontrol.invalid ? 'Wajib diisi.' : ''"`.
   */
  readonly error = input('');

  /**
   * Id kontrol di dalam field. Kosongkan saja — field membuat id sendiri dan memasangnya ke
   * kontrol. Isi hanya kalau aplikasi memang butuh id tertentu.
   */
  readonly id = input('');

  /** @internal Id yang dilaporkan `WuiInput` dari kontrol (id milik aplikasi, kalau ada). */
  readonly #controlId = signal<string | null>(null);

  /** @internal Dibuat sekali per instance — dasar id yang unik. */
  readonly #fallbackId = `wui-form-field-${++nomorUrut}`;

  /**
   * Id yang dipakai kontrol di dalam field ini: id dari aplikasi (lewat `id` input atau atribut
   * `id` pada kontrolnya), atau id buatan field.
   */
  readonly controlId: Signal<string> = computed(
    () => this.id() || this.#controlId() || this.#fallbackId,
  );

  /** Id elemen pesan — sasaran `aria-describedby` pada kontrol. */
  readonly messageId: Signal<string> = computed(() => `${this.controlId()}-message`);

  /** Pesan yang sedang tampil: `error` menang atas `hint`. */
  readonly message: Signal<string> = computed(() => this.error() || this.hint());

  /** Ada pesan error yang tampil. */
  readonly invalid: Signal<boolean> = computed(() => !!this.error());

  /**
   * Laporkan id yang sudah ada di kontrol supaya `for` label menunjuk elemen yang benar.
   * @internal dipanggil `WuiInput`, bukan kode aplikasi.
   */
  reportControlId(id: string | null): void {
    this.#controlId.set(id);
  }
}
