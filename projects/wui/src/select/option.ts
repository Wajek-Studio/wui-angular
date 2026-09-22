import { Highlightable } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  inject,
  input,
  signal,
} from '@angular/core';

/** @internal Penomoran id opsi. */
let nomorUrut = 0;

/**
 * Satu pilihan di dalam `<wui-select>`.
 *
 * ```html
 * <wui-select wuiInput placeholder="Pilih kota">
 *   <wui-option>Jakarta</wui-option>
 *   <wui-option value="bdg">Bandung</wui-option>
 *   <wui-option value="sby" disabled>Surabaya</wui-option>
 * </wui-select>
 * ```
 *
 * **Isinya diproyeksikan** (`<ng-content>`), dan itu alasan utamanya dibuat komponen alih-alih
 * directive: aplikasi bisa menaruh apa pun di dalam satu opsi — ikon, dua baris teks, badge — tanpa
 * kehilangan desain default-nya. Desain default itu datang dari class `.wui-option` di style layer
 * (tinggi minimum, jarak, warna, keadaan terpilih/nonaktif/hover), jadi opsi paling sederhana
 * (`<wui-option>Jakarta</wui-option>`) sudah tampil benar tanpa satu class pun.
 *
 * Yang **tidak** dikerjakan di sini dengan sengaja: klik dan navigasi keyboard. Klik diteruskan
 * panelnya ke `WuiSelect` (satu listener untuk semua opsi, bukan satu per opsi), dan navigasi panah
 * dikerjakan `ActiveDescendantKeyManager` milik select lewat kontrak `Highlightable` di bawah —
 * opsi cukup menyalakan/mematikan class `.is-active` miliknya sendiri.
 *
 * `value` **opsional**: kalau tidak ditulis, nilainya adalah teks opsinya (di-trim) — jadi opsi
 * sederhana tidak perlu atribut apa pun, dan teks yang sama dipakai sebagai label type-ahead nanti.
 */
@Component({
  selector: 'wui-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'wui-option',
    role: 'option',
    // Id stabil — nanti jadi sasaran `aria-activedescendant` di host select saat opsi ini ditunjuk.
    '[attr.id]': 'id',
    '[attr.aria-selected]': 'terpilih() ? "true" : "false"',
    '[attr.aria-disabled]': 'nonaktif() ? "true" : null',
    '[class.is-terpilih]': 'terpilih()',
    '[class.is-active]': 'aktif()',
  },
})
export class WuiOption implements Highlightable {
  /** Nilai opsi. Tidak ditulis = teks opsinya. */
  readonly value = input<unknown>(undefined);

  /**
   * Opsi nonaktif: tidak bisa dipilih (dan nanti dilewati navigasi panah).
   *
   * Namanya `nonaktif` (bukan `disabled`) karena `ListKeyManager` CDK menuntut properti `disabled`
   * bertipe **boolean biasa**, sementara input Angular berupa signal. Alias menjaga markup aplikasi
   * tetap `disabled`, dan getter `disabled` di bawah memenuhi kontrak CDK-nya (dipakai di F2c).
   */
  readonly nonaktif = input(false, { transform: booleanAttribute, alias: 'disabled' });

  /**
   * Label untuk type-ahead (F2c) **dan** untuk teks nilai terpilih.
   *
   * Wajib diisi kalau isi opsinya lebih dari satu teks (mis. judul + keterangan), karena label
   * bawaannya dibaca dari seluruh teks di dalam opsi — dua teks akan tersambung tanpa pemisah.
   * Tidak ditulis = teks opsinya.
   */
  readonly typeaheadLabel = input<string | undefined>(undefined);

  /** @internal Elemen host — dipakai `WuiSelect` untuk mencocokkan klik di panel ke opsi ini. */
  readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** @internal Id stabil opsi. */
  readonly id = `wui-option-${++nomorUrut}`;

  /** @internal Sedang terpilih (nilainya sama dengan nilai select-nya). */
  readonly terpilih = signal(false);

  /** @internal Sedang ditunjuk keyboard (class `.is-active`). */
  readonly aktif = signal(false);

  // ── Kontrak `Highlightable` (dipanggil `ActiveDescendantKeyManager`) ────────
  // Keduanya memang dipanggil CDK: yang lama di-`setInactiveStyles()`, yang baru di
  // `setActiveStyles()` (`fesm2022/activedescendant-key-manager.mjs:4-11`).

  setActiveStyles(): void {
    this.aktif.set(true);
  }

  setInactiveStyles(): void {
    this.aktif.set(false);
  }

  /** Kontrak `ListKeyManagerOption` CDK — boolean biasa, dibaca `skipPredicate` (F2c). */
  get disabled(): boolean {
    return this.nonaktif();
  }

  /**
   * Nilai efektif opsi: `value` kalau ditulis, kalau tidak teks opsinya.
   * @internal dibaca `WuiSelect` saat membandingkan dengan nilai terpilih.
   */
  get nilai(): unknown {
    const nilai = this.value();

    return nilai === undefined ? this.getLabel() : nilai;
  }

  /** Label opsi — teks di dalamnya (`ng-content`), atau `typeaheadLabel` kalau ditulis. */
  getLabel(): string {
    return (this.typeaheadLabel() ?? this.host.textContent ?? '').trim();
  }

  /** @internal dipanggil `WuiSelect` saat nilai select berubah. */
  tandaiTerpilih(terpilih: boolean): void {
    this.terpilih.set(terpilih);
  }
}
