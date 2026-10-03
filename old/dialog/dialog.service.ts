import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import {
  Injectable,
  Injector,
  Signal,
  TemplateRef,
  Type,
  computed,
  inject,
  signal,
} from '@angular/core';

import { WuiAlertDialog, WuiAlertDialogData } from './alert-dialog';
import { WUI_DIALOG_DATA, WuiAlertButton, WuiAlertOptions, WuiDialogOptions } from './dialog.options';
import { WuiDialogRef } from './dialog.ref';

/** @internal Penomoran id dialog. */
let nomorUrut = 0;

/**
 * @internal Satu dialog yang sedang terbuka.
 *
 * Sengaja **tanpa** generic: menyimpan `WuiDialogRef<R, C>` di daftar akan menularkan `R`/`C`
 * ke seluruh service, dan karena kelasnya punya field privat bertipe generic, `WuiDialogRef<R, C>`
 * tidak assignable ke `WuiDialogRef<unknown, unknown>`.
 */
interface WuiOpenDialog {
  readonly close: () => void;
}

/**
 * Salin hanya properti yang benar-benar diisi.
 *
 * CDK menggabungkan konfigurasi dengan `{ ...defaults, ...config }` — **tanpa** menyaring
 * `undefined`. Menyalin nilai kosong akan mematikan default CDK: `hasBackdrop: undefined`
 * menghilangkan backdrop, `role: undefined` menghapus atribut `role`, dan `restoreFocus:
 * undefined` mematikan pengembalian fokus. Karena itu opsi yang tidak diisi tidak boleh ikut.
 */
function onlyDefined<D>(options: WuiDialogOptions<D> | undefined): Partial<WuiDialogOptions<D>> {
  const hasil: Record<string, unknown> = {};

  for (const [kunci, nilai] of Object.entries(options ?? {})) {
    if (nilai !== undefined && kunci !== 'injector') {
      hasil[kunci] = nilai;
    }
  }

  return hasil as Partial<WuiDialogOptions<D>>;
}

/**
 * Gabungkan class dasar wui dengan class tambahan dari aplikasi.
 *
 * Class dasar **tidak bisa** dihilangkan: permukaan dialog (latar, radius, padding, elevasi)
 * datang dari `.wui-dialog`, dan dialog tanpa permukaan selalu terlihat seperti bug.
 */
function withBaseClass(base: string, extra: string | string[] | undefined): string[] {
  if (!extra) {
    return [base];
  }

  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}

/** Ubah `string | string[]` menjadi array — untuk opsi yang menerima keduanya. */
function toArray(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

/**
 * Samakan bentuk tombol dialog sistem: `string` menjadi objek dengan gaya default (bentuk `text`,
 * warna netral). Tombol yang tidak diisi diberi `['OK']` supaya dialog tetap punya jalan keluar.
 */
function normalizeButtons(
  buttons: readonly (string | WuiAlertButton)[] | undefined,
): readonly WuiAlertButton[] {
  const daftar = buttons?.length ? buttons : ['OK'];

  return daftar.map((tombol): WuiAlertButton =>
    typeof tombol === 'string' ? { label: tombol, variant: 'text' } : tombol,
  );
}

/**
 * Dialog modal — dirender ke `document.body`, dikelola menumpuk, dan mengembalikan hasil.
 *
 * Berbeda dari `WuiPageService` yang menumpuk page **di dalam** `<wui-app>` dan dikendalikan
 * lifecycle komponen halaman, dialog dibuka **secara imperatif** dari mana saja lalu ditutup
 * oleh pemanggil, tombol di dalam dialog, ESC, atau klik backdrop:
 *
 * ```ts
 * private readonly dialogs = inject(WuiDialogService);
 *
 * protected async hapus(produk: Produk) {
 *   const ref = this.dialogs.open<boolean>(KonfirmasiHapus, { data: produk });
 *   if (await ref.result) { ... }
 * }
 * ```
 *
 * Mesinnya `Dialog` dari `@angular/cdk` (overlay + focus trap + ARIA), tapi tipe CDK tidak
 * diekspor: aplikasi cukup berurusan dengan `WuiDialogRef`, `WuiDialogOptions`, dan
 * `WUI_DIALOG_DATA`.
 */
@Injectable({ providedIn: 'root' })
export class WuiDialogService {
  readonly #dialog = inject(Dialog);
  readonly #injector = inject(Injector);
  readonly #open = signal<readonly WuiOpenDialog[]>([]);

  /** Jumlah dialog yang sedang terbuka. */
  readonly count: Signal<number> = computed(() => this.#open().length);

  /**
   * Buka dialog dari sebuah komponen.
   *
   * Urutan generic mengikuti CDK (`R` dulu) supaya hasilnya bisa ditulis singkat —
   * `open<boolean>(KonfirmasiHapus, { data })` — sedangkan `C` dan `D` ditebak otomatis.
   *
   * `result` bernilai `undefined` kalau dialog ditutup lewat ESC/backdrop/`closeAll()`.
   */
  open<R = unknown, C = unknown, D = unknown>(
    component: Type<C>,
    options?: WuiDialogOptions<D>,
  ): WuiDialogRef<R, C> {
    const ref = this.#createRef<R, C, D>(options);

    return this.#register(ref, this.#dialog.open<R, D, C>(component, this.#buildConfig(options, ref)));
  }

  /**
   * Buka dialog dari `<ng-template>`.
   *
   * Konteks template disediakan CDK: `let-data` (nilai `options.data`) dan
   * `let-dialogRef="dialogRef"`. Catatan: `dialogRef` di konteks itu milik CDK, sedangkan
   * `WuiDialogRef` yang dikembalikan method ini bisa di-inject oleh komponen yang dirender
   * di dalam template tersebut.
   *
   * Karena tidak ada komponen pemilik, `component()` **selalu `null`** di mode ini.
   */
  openTemplate<R = unknown, D = unknown>(
    template: TemplateRef<D>,
    options?: WuiDialogOptions<D>,
  ): WuiDialogRef<R, D> {
    const ref = this.#createRef<R, D, D>(options);

    return this.#register(ref, this.#dialog.open<R, D, D>(template, this.#buildConfig(options, ref)));
  }

  /**
   * Dialog sistem siap pakai: judul + konten + tombol, hasilnya **index tombol** yang ditekan.
   *
   * Pintasan dari `open()` yang tidak butuh komponen maupun `<ng-template>` di sisi aplikasi —
   * dipakai untuk pesan yang tidak punya tata letak sendiri, mis. error dari API:
   *
   * ```ts
   * const aksi = await this.dialogs.alert({
   *   title: 'Gagal menyimpan kontak',
   *   content: 'Server menolak permintaan.<br><code>HTTP 500</code>',
   *   buttons: ['Tutup', { label: 'Coba lagi', variant: 'filled', color: 'primary' }],
   * });
   *
   * if (aksi === 1) { this.simpanUlang(); }
   * ```
   *
   * Selalu `role="alertdialog"` — label ARIA-nya dari `title`, deskripsinya dari `content`.
   * Hasilnya salah satu dari:
   * - `0 … n-1` — index tombol yang ditekan (sesuai urutan `buttons`)
   * - `null` — ditutup tanpa memilih tombol (ESC / klik backdrop), hanya mungkin kalau `dismissible`
   */
  alert(options: WuiAlertOptions): Promise<number | null> {
    const id = options.id ?? `wui-alert-${++nomorUrut}`;
    const titleId = `${id}-title`;
    const contentId = options.content ? `${id}-content` : null;

    const data: WuiAlertDialogData = {
      title: options.title,
      titleId,
      content: options.content ?? null,
      contentId,
      buttons: normalizeButtons(options.buttons),
    };

    const ref = this.open<number, WuiAlertDialog, WuiAlertDialogData>(WuiAlertDialog, {
      id,
      data,
      role: 'alertdialog',
      ariaLabelledBy: titleId,
      ariaDescribedBy: contentId ?? undefined,
      // `disableClose` CDK adalah kebalikan dari `dismissible`.
      disableClose: options.dismissible === false,
      panelClass: ['wui-dialog--alert', ...toArray(options.panelClass)],
    });

    // `undefined` dari CDK (ditutup tanpa hasil) diterjemahkan jadi `null` supaya hanya ada satu
    // nilai yang berarti "tidak memilih tombol".
    return ref.result.then((hasil) => hasil ?? null);
  }

  /** Tutup semua dialog yang terbuka, mulai dari yang paling akhir dibuka. */
  closeAll(): void {
    for (const ref of [...this.#open()].reverse()) {
      ref.close();
    }
  }

  /**
   * Bungkus opsi aplikasi jadi `DialogConfig`.
   *
   * Injector internal dititipkan lewat `config.injector` (CDK memakainya untuk portal komponen
   * maupun template), jadi `WuiDialogRef` dan `WUI_DIALOG_DATA` bisa di-inject dari dalam dialog
   * tanpa aplikasi perlu tahu token milik CDK.
   */
  #buildConfig<R, C, D>(
    options: WuiDialogOptions<D> | undefined,
    ref: WuiDialogRef<R, C>,
  ): DialogConfig<D, DialogRef<R, C>> {
    const injector = Injector.create({
      parent: options?.injector ?? this.#injector,
      providers: [
        { provide: WuiDialogRef, useValue: ref },
        { provide: WUI_DIALOG_DATA, useValue: options?.data ?? null },
      ],
    });

    const config = new DialogConfig<D, DialogRef<R, C>>();

    config.id = ref.id;
    // Dipaksa `true`: default CDK justru `false`, padahal dialog ini selalu modal.
    // Konsekuensinya `aria-modal="true"` selalu ada di DOM dan tidak bisa dimatikan pemakai.
    config.ariaModal = true;
    config.injector = injector;

    // Opsi aplikasi menimpa default di atas — tapi hanya yang terisi (lihat `onlyDefined`).
    Object.assign(config, onlyDefined(options));

    // Dipasang SETELAH opsi aplikasi: `panelClass` dari aplikasi bersifat tambahan, sedangkan
    // `backdropClass` boleh menggantikan (mis. `cdk-overlay-transparent-backdrop` untuk
    // dialog tanpa dim).
    config.panelClass = withBaseClass('wui-dialog', options?.panelClass);
    config.backdropClass = options?.backdropClass ?? 'wui-dialog__backdrop';

    return config;
  }

  #createRef<R, C, D>(options: WuiDialogOptions<D> | undefined): WuiDialogRef<R, C> {
    return new WuiDialogRef<R, C>(options?.id ?? `wui-dialog-${++nomorUrut}`);
  }

  /**
   * Sambungkan ref ke dialog CDK, catat dialog yang terbuka, dan lepas saat ditutup.
   *
   * Penutupan selalu lewat satu jalur: apa pun yang menutup dialog (ref, ESC, backdrop), event
   * `closed` dari CDK yang menandai `closed()` dan menyelesaikan `result` — jadi status ref tidak
   * pernah bisa berbeda dari kenyataan.
   */
  #register<R, C>(ref: WuiDialogRef<R, C>, cdkRef: DialogRef<R, C>): WuiDialogRef<R, C> {
    ref.sambungkan({ close: (hasil) => cdkRef.close(hasil) }, cdkRef.componentInstance);

    // Token identitas untuk daftar dialog terbuka — `close()` tanpa hasil sama dengan
    // "ditutup bukan oleh pemanggil" (ESC, backdrop, `closeAll()`).
    const token: WuiOpenDialog = { close: () => ref.close() };

    cdkRef.closed.subscribe((hasil) => {
      ref.tandaiTutup(hasil);
      this.#open.update((list) => list.filter((item) => item !== token));
    });

    this.#open.update((list) => [...list, token]);

    return ref;
  }
}
