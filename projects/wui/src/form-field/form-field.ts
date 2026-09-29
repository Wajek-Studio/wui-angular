import { Component, ElementRef, Signal, computed, inject, input, signal } from '@angular/core';

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
    // Klik label hanya otomatis memfokuskan elemen *labelable* (input/textarea/select/button).
    // Kontrol kustom seperti `<wui-select>` bukan salah satunya, jadi jalur itu ditambahkan di sini.
    '(click)': 'fokuskanKontrol($event)',
  },
})
export class WuiFormField {
  readonly #element = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Elemen host field.
   *
   * @internal dipakai `WuiSelect` supaya lebar panelnya mengikuti lebar **field** — bukan hanya lebar
   * kontrolnya. Keduanya sama selama kontrol mengisi field (`width: 100%`), tapi field-lah yang tetap
   * benar kalau suatu saat ia punya padding atau kolom sendiri.
   */
  get host(): HTMLElement {
    return this.#element.nativeElement;
  }

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

  /**
   * Fokuskan kontrol saat labelnya diklik — **hanya** untuk kontrol yang bukan elemen labelable.
   *
   * `for` pada `<label>` hanya memfokuskan elemen yang dikenali HTML (`input`, `textarea`, `select`,
   `button`, …). Elemen kustom seperti `<wui-select>` tidak termasuk, jadi klik labelnya akan
   "diam" — padahal label itu tetap menunjuk id yang benar untuk screen reader. Karena kitalah yang
   membuat label dan kontrolnya (K3/L7), jalur fokusnya ditambahkan di sini alih-alih meminta
   aplikasi menulis `(click)` sendiri.
   *
   * Kontrol native tidak lagi dilewatkan: sejak labelnya `pointer-events: none` (supaya klik tidak
   * tertelan label yang menutupi kontrol), method ini yang mengambil alih **semua** klik di area
   * field yang bukan area kontrol dan bukan pesan. Jadi mengeklik label yang mengapung, atau ruang
   * kosong di dalam kotak, tetap berakhir di kontrolnya — untuk kontrol native sekalipun.
   * @internal dipanggil host listener, bukan kode aplikasi.
   */
  protected fokuskanKontrol(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (!target) {
      return;
    }

    // Pesan hint/error bukan area kontrol — jangan jadi jalan pintas untuk memfokuskan apa pun.
    if (target.closest('.wui-form-field__message')) {
      return;
    }

    const kontrol = this.#cariKontrol();

    // Klik di dalam kontrol adalah urusan kontrolnya sendiri (fokus, pemilihan teks, buka panel).
    if (!kontrol || kontrol === target || kontrol.contains(target)) {
      return;
    }

    kontrol.focus();
  }

  /** Elemen di dalam field yang id-nya dipakai label — kontrolnya sendiri. */
  #cariKontrol(): HTMLElement | null {
    const id = this.controlId();

    for (const elemen of this.#element.nativeElement.querySelectorAll<HTMLElement>('[id]')) {
      if (elemen.id === id) {
        return elemen;
      }
    }

    return null;
  }
}
