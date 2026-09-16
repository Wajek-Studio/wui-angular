import { EmbeddedViewRef, Signal } from '@angular/core';

/**
 * Handle untuk satu page di tumpukan.
 *
 * Diperoleh dari return value `WuiPageService.push()` / `WuiPageService.replace()`.
 * Yang menentukan kapan page ditutup adalah komponen pemiliknya — biasanya di `ngOnDestroy`:
 *
 * ```ts
 * ngOnInit() { this.ref = this.pages.push(this.pageTpl); }
 * ngOnDestroy() { this.ref?.close(); }
 * ```
 */
export class WuiPageRef<C = unknown> {
  constructor(
    /** Id unik page (untuk debugging/tracking). */
    readonly id: string,

    /** Embedded view yang memuat konten page. */
    readonly view: EmbeddedViewRef<C>,

    /** Posisi di tumpukan, 0 = paling bawah. */
    readonly index: Signal<number>,

    /** Apakah page ini yang paling atas (aktif, menerima fokus & event). */
    readonly isTop: Signal<boolean>,

    /** Sudah ditutup atau belum. */
    readonly closed: Signal<boolean>,

    /**
     * Dipakai service untuk menutup page. Tidak untuk dipanggil langsung.
     * Sengaja tanpa parameter supaya tidak ada masalah variance pada generic `C`.
     */
    private readonly closeFn: () => void,
  ) {}

  /**
   * Tutup page ini.
   *
   * **Idempoten**: aman dipanggil berkali-kali dan aman dipanggil walau service sudah
   * menutupnya lebih dulu (mis. dari `ngOnDestroy` komponen pemilik).
   */
  close(): void {
    this.closeFn();
  }
}
