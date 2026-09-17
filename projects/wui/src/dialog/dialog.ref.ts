import { Signal, WritableSignal, signal } from '@angular/core';

/**
 * Handle untuk satu dialog, sekaligus tempat mengambil hasilnya.
 *
 * Diperoleh dari return value `WuiDialogService.open()` / `openTemplate()`. Ref yang sama juga
 * bisa di-inject dari dalam dialog — berguna kalau komponen dialog perlu menutup dirinya sendiri:
 *
 * ```ts
 * private readonly ref = inject<WuiDialogRef<boolean>>(WuiDialogRef);
 * protected simpan() { this.ref.close(true); }
 * ```
 *
 * Urutan generic `R` (hasil) lebih dulu dari `C` (konten) — mengikuti `DialogRef` milik CDK,
 * karena `R` jauh lebih sering ditulis: `WuiDialogRef<boolean>`. `C` adalah tipe komponennya,
 * atau tipe konteks template pada dialog `<ng-template>` — di mode itu `component()` selalu
 * `null` karena memang tidak ada komponen pemilik.
 */
export class WuiDialogRef<R = unknown, C = unknown> {
  readonly #closed: WritableSignal<boolean> = signal(false);
  readonly #component: WritableSignal<C | null> = signal<C | null>(null);
  readonly #result: Promise<R | undefined>;
  #resolveResult: ((value: R | undefined) => void) | null = null;

  /** Sambungan ke dialog CDK — null selama dialog belum benar-benar dibuat. */
  #handle: { close(result?: R): void } | null = null;

  /** Hasil tertunda: `close()` bisa dipanggil sebelum handle tersambung (mis. dari `ngOnInit`). */
  #pending: { result: R | undefined } | null = null;

  constructor(
    /** Id unik dialog (untuk debugging/tracking). */
    readonly id: string,
  ) {
    this.#result = new Promise<R | undefined>((resolve) => {
      this.#resolveResult = resolve;
    });
  }

  /**
   * Instance komponen dialog.
   * `null` sebelum dialog dibuat dan pada mode `<ng-template>` (memang tanpa komponen).
   */
  readonly component: Signal<C | null> = this.#component.asReadonly();

  /** Sudah ditutup atau belum. */
  readonly closed: Signal<boolean> = this.#closed.asReadonly();

  /**
   * Selesai saat dialog ditutup.
   *
   * Nilainya `close(result)` yang dikirim penutup, atau `undefined` bila ditutup tanpa hasil
   * (ESC / klik backdrop / `closeAll()`):
   *
   * ```ts
   * const ref = this.dialogs.open<boolean>(KonfirmasiHapus, { data: { nama: 'Produk A' } });
   * if (await ref.result) { ... }
   * ```
   *
   * Sengaja `Promise`, bukan `Observable`, supaya pemakaian di aplikasi zoneless sesederhana
   * `await`. Kalau butuh RxJS, cukup dibungkus di sisi pemakai: `from(ref.result)`.
   */
  get result(): Promise<R | undefined> {
    return this.#result;
  }

  /**
   * Tutup dialog ini dan kirim `result` ke pemanggil.
   *
   * **Idempoten**: aman dipanggil berkali-kali, dan aman walau dialog sudah ditutup lebih dulu
   * oleh ESC/backdrop.
   */
  close(result?: R): void {
    if (this.#closed()) {
      return;
    }

    // Bisa terjadi sebelum handle siap (komponen dialog memanggil `close()` dari `ngOnInit`) —
    // hasilnya dititipkan dan baru dikirim saat tersambung.
    if (!this.#handle) {
      this.#pending = { result };

      return;
    }

    this.#handle.close(result);
  }

  /**
   * Sambungkan ke dialog milik CDK.
   * @internal dipanggil `WuiDialogService` tepat setelah dialognya dibuat — bukan kode aplikasi.
   */
  sambungkan(handle: { close(result?: R): void }, component: C | null): void {
    this.#handle = handle;
    this.#component.set(component);

    const pending = this.#pending;

    if (pending) {
      this.#pending = null;
      handle.close(pending.result);
    }
  }

  /**
   * Tandai dialog sudah tertutup dan selesaikan `result`.
   * @internal dipanggil `WuiDialogService` saat event `closed` dari CDK diterima.
   */
  tandaiTutup(result: R | undefined): void {
    if (this.#closed()) {
      return;
    }

    this.#closed.set(true);
    this.#resolveResult?.(result);
  }
}
