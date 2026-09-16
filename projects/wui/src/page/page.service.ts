import {
  EmbeddedViewRef,
  Injectable,
  Signal,
  TemplateRef,
  ViewContainerRef,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';

import { WuiPageOptions } from './page.options';
import { WuiPageRef } from './page.ref';

/** @internal Satu entri di tumpukan. */
interface WuiPageEntry {
  readonly ref: WuiPageRef<unknown>;
  readonly view: EmbeddedViewRef<unknown>;
  readonly index: WritableSignal<number>;
  readonly isTop: WritableSignal<boolean>;
  readonly closed: WritableSignal<boolean>;
}

/** @internal Penomoran id page. */
let nomorUrut = 0;

/**
 * Sumber kebenaran urutan tumpukan page.
 *
 * Service ini hanya mengeksekusi perintah dan menjaga konsistensi tumpukan — **tidak pernah**
 * memutuskan sendiri kapan page dibuka atau ditutup. Komponen yang menentukan:
 *
 * ```ts
 * // komponen yang berperan sebagai halaman
 * @ViewChild('page', { static: true }) private readonly pageTpl!: TemplateRef<unknown>;
 * private ref?: WuiPageRef;
 *
 * ngOnInit() { this.ref = this.pages.push(this.pageTpl); }   // atau replace()
 * ngOnDestroy() { this.ref?.close(); }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class WuiPageService {
  readonly #entries = signal<WuiPageEntry[]>([]);
  readonly #host = signal<ViewContainerRef | null>(null);

  /**
   * Tumpukan page, indeks 0 = paling bawah.
   * Entry yang view-nya sudah dihancurkan Angular otomatis disaring.
   */
  readonly stack: Signal<readonly WuiPageRef<unknown>[]> = computed(() =>
    this.#entries()
      .filter((entry) => !entry.view.destroyed)
      .map((entry) => entry.ref),
  );

  /** Jumlah page yang aktif di tumpukan. */
  readonly depth: Signal<number> = computed(() => this.stack().length);

  /** Page paling atas — yang menerima fokus & pointer event. */
  readonly active: Signal<WuiPageRef<unknown> | null> = computed(() => this.stack().at(-1) ?? null);

  /**
   * Menyerahkan overlay host milik `WuiApp`.
   * @internal dipanggil oleh `WuiApp`, bukan oleh kode aplikasi.
   */
  attachHost(host: ViewContainerRef): void {
    const current = this.#host();

    if (current && current !== host) {
      throw new Error(
        '[wui] Overlay host sudah terpasang. Pastikan <wui-app> hanya dipakai satu kali di aplikasi.',
      );
    }

    this.#host.set(host);
  }

  /**
   * Melepas overlay host. View dikosongkan tanpa dihancurkan manual karena Angular
   * sudah menghancurkannya bersama container milik `WuiApp`.
   * @internal dipanggil oleh `WuiApp`, bukan oleh kode aplikasi.
   */
  detachHost(): void {
    this.#host.set(null);
    this.#entries.set([]);
  }

  /** Tumpuk page baru di atas tumpukan yang ada. */
  push<C>(template: TemplateRef<C>, options?: WuiPageOptions<C>): WuiPageRef<C> {
    return this.#create(template, options, false);
  }

  /**
   * Ganti page paling atas dengan page baru — tanpa menambah kedalaman tumpukan.
   * Dipakai untuk alur bertahap (step 1 → step 2).
   */
  replace<C>(template: TemplateRef<C>, options?: WuiPageOptions<C>): WuiPageRef<C> {
    return this.#create(template, options, true);
  }

  /** Tutup satu page. Idempoten: aman dipanggil berkali-kali. */
  close(ref: WuiPageRef<unknown>): void {
    const entry = this.#entries().find((item) => item.ref === ref);

    // Tidak ada di daftar = sudah tertutup (atau view-nya sudah dihancurkan Angular).
    if (!entry || entry.closed()) {
      return;
    }

    entry.closed.set(true);

    if (!entry.view.destroyed) {
      entry.view.destroy();
    }

    this.#entries.update((list) => list.filter((item) => item !== entry));
    this.#sync();
  }

  /** Tutup page paling atas. */
  closeTop(): void {
    const top = this.active();

    if (top) {
      this.close(top);
    }
  }

  /** Tutup semua page, dari yang paling atas. */
  closeAll(): void {
    for (const ref of [...this.stack()].reverse()) {
      this.close(ref);
    }
  }

  #create<C>(
    template: TemplateRef<C>,
    options: WuiPageOptions<C> | undefined,
    ganti: boolean,
  ): WuiPageRef<C> {
    const host = this.#host();

    if (!host) {
      throw new Error(
        '[wui] WuiPageService.push()/replace() dipanggil sebelum overlay host siap. ' +
          'Pastikan <wui-app> ada di root aplikasi, dan panggilan terjadi setelah view-nya dibuat ' +
          '(mis. dari ngOnInit komponen yang dimuat router).',
      );
    }

    this.#prune();

    if (ganti) {
      this.closeTop();
    }

    const view = host.createEmbeddedView(
      template,
      options?.context,
      options?.injector ? { injector: options.injector } : undefined,
    );

    const index = signal(0);
    const isTop = signal(false);
    const closed = signal(false);

    // `ref` di-capture oleh closure — jadi callback-nya tidak perlu menerima parameter
    // bertipe `WuiPageRef<C>`, yang akan bentrok dengan variance generic di `close()`.
    let ref: WuiPageRef<C>;
    ref = new WuiPageRef<C>(
      options?.id ?? `wui-page-${++nomorUrut}`,
      view,
      index.asReadonly(),
      isTop.asReadonly(),
      closed.asReadonly(),
      () => this.close(ref),
    );

    // Wadah overlay host ber-`pointer-events: none` supaya tidak memblokir aplikasi.
    // Node akar page harus mengaktifkannya sendiri — juga sebagai jaring pengaman
    // kalau style layer global belum dimuat aplikasi.
    for (const node of view.rootNodes) {
      const element = node as HTMLElement;

      if (element?.classList) {
        element.classList.add('wui-page-layer');
      }

      if (element?.style) {
        element.style.pointerEvents = 'auto';
      }
    }

    this.#entries.update((list) => [
      ...list,
      {
        ref: ref as WuiPageRef<unknown>,
        view: view as EmbeddedViewRef<unknown>,
        index,
        isTop,
        closed,
      },
    ]);
    this.#sync();

    return ref;
  }

  /**
   * Buang entry yang view-nya sudah dihancurkan Angular.
   *
   * Angular menghancurkan embedded view secara otomatis begitu komponen pemiliknya mati,
   * jadi tanpa prune `depth`/`active` bisa menunjuk page yang sebenarnya sudah hilang.
   */
  #prune(): void {
    const list = this.#entries();
    const hidup = list.filter((entry) => !entry.view.destroyed);

    if (hidup.length === list.length) {
      return;
    }

    for (const entry of list) {
      if (entry.view.destroyed) {
        entry.closed.set(true);
      }
    }

    this.#entries.set(hidup);
    this.#sync();
  }

  /** Perbarui posisi & status seluruh entry setelah tumpukan berubah. */
  #sync(): void {
    const list = this.#entries();

    list.forEach((entry, posisi) => {
      entry.index.set(posisi);
      entry.isTop.set(posisi === list.length - 1);
    });
  }
}
