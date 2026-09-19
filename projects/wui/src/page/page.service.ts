import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  EmbeddedViewRef,
  Injectable,
  PLATFORM_ID,
  Signal,
  TemplateRef,
  ViewContainerRef,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';

import { WuiPageOptions } from './page.options';
import { WuiPageRef } from './page.ref';

/** @internal Satu entri di tumpukan. */
interface WuiPageEntry {
  readonly ref: WuiPageRef<unknown>;
  readonly view: EmbeddedViewRef<unknown>;
  /** Elemen pertama node akar page — sasaran focus trap & `aria-hidden` antar layer. */
  readonly layer: HTMLElement | null;
  /** Focus trap milik layer ini; hanya aktif saat layer-nya jadi page teratas. */
  readonly trap: FocusTrap | null;
  /** Elemen yang sedang fokus saat page dibuka — tujuan pengembalian fokus saat ditutup. */
  readonly trigger: HTMLElement | null;
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

  readonly #trapFactory = inject(FocusTrapFactory);
  readonly #document = inject(DOCUMENT);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Elemen shell aplikasi (topbar, sidenav, konten router) yang sedang disembunyikan. */
  #shellHidden: HTMLElement[] = [];

  /** Nilai `aria-hidden` sebelum kita ubah, supaya bisa dikembalikan apa adanya. */
  readonly #previousAriaHidden = new Map<HTMLElement, string | null>();

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
    for (const entry of this.#entries()) {
      entry.trap?.destroy();
    }

    this.#showShellBehind();
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

    const duluTeratas = entry.isTop();

    entry.closed.set(true);

    // Trap dilepas SEBELUM view dihancurkan — anchor-nya hidup di DOM di sekitar layer.
    entry.trap?.destroy();

    if (!entry.view.destroyed) {
      entry.view.destroy();
    }

    this.#entries.update((list) => list.filter((item) => item !== entry));
    this.#sync();

    // Fokus dikembalikan hanya untuk page teratas: menutup page dari tengah tumpukan bukan
    // aksi yang mengubah apa yang dilihat pengguna, jadi fokus tidak perlu dipindah.
    if (duluTeratas) {
      this.#restoreFocus(entry);
    }
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
    let layer: HTMLElement | null = null;

    for (const node of view.rootNodes) {
      const element = node as HTMLElement;

      if (element?.classList) {
        element.classList.add('wui-page-layer');

        // Elemen pertama jadi sasaran focus trap — template page diharapkan punya satu node
        // akar (pola `<ng-template #page><wui-page>…</wui-page></ng-template>`).
        layer ??= element;
      }

      if (element?.style) {
        element.style.pointerEvents = 'auto';
      }
    }

    const entry: WuiPageEntry = {
      ref: ref as WuiPageRef<unknown>,
      view: view as EmbeddedViewRef<unknown>,
      layer,
      // `FocusTrap` biasa (bukan `ConfigurableFocusTrap`): mekanisme yang sama dengan
      // `cdk/dialog` dan `cdkTrapFocus`. Versi ber-`FocusTrapManager` memasang listener `focus`
      // di seluruh dokumen, sehingga akan merebut fokus kembali ke page saat dialog dibuka di
      // atasnya — dialog dirender ke `document.body`, di luar elemen page.
      trap: this.#isBrowser && layer ? this.#trapFactory.create(layer) : null,
      trigger: this.#isBrowser ? (this.#document.activeElement as HTMLElement | null) : null,
      index,
      isTop,
      closed,
    };

    this.#entries.update((list) => [...list, entry]);
    this.#sync();

    // Fokus masuk ke page yang baru muncul — page teratas adalah tujuan navigasi.
    void entry.trap?.focusInitialElementWhenReady();

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

        // View sudah hilang (biasanya karena route berpindah) — anchor trap ikut dilepas
        // supaya tidak tertinggal di DOM, dan `aria-hidden` layer-nya dibersihkan dari catatan.
        entry.trap?.destroy();
        this.#show(entry.layer);
      }
    }

    this.#entries.set(hidup);
    this.#sync();
  }

  /** Perbarui posisi, status, dan kondisi a11y seluruh entry setelah tumpukan berubah. */
  #sync(): void {
    const list = this.#entries();

    list.forEach((entry, posisi) => {
      const teratas = posisi === list.length - 1;

      entry.index.set(posisi);
      entry.isTop.set(teratas);

      // Hanya focus trap page teratas yang aktif: `enabled = false` mematikan anchor trap
      // sehingga urutan tab tidak pernah "terjebak" di layer bawah.
      if (entry.trap) {
        entry.trap.enabled = teratas;
      }
    });

    this.#syncA11y();
  }

  /**
   * Samakan kondisi a11y dengan isi tumpukan.
   *
   * Dua hal yang dijaga: layer yang bukan teratas disembunyikan dari screen reader, dan selama
   * ada page, isi shell aplikasi (topbar, sidenav, konten router) juga disembunyikan — meniru
   * cara `cdk/dialog` menyembunyikan konten di luar dialog.
   *
   * Sengaja `aria-hidden`, bukan atribut `inert`: yang perlu dicegah adalah pembacaan screen
   * reader, sedangkan urutan tab sudah ditahan focus trap dan klik sudah tertahan layer teratas
   * yang menutup layar.
   */
  #syncA11y(): void {
    if (!this.#isBrowser) {
      return;
    }

    const list = this.#entries();

    for (const entry of list) {
      if (!entry.layer) {
        continue;
      }

      if (entry.isTop()) {
        this.#show(entry.layer);
      } else {
        this.#hide(entry.layer);
      }
    }

    const host = this.#hostElement();

    if (list.length && host) {
      this.#hideShellBehind(host);
    } else {
      this.#showShellBehind();
    }
  }

  /**
   * Sembunyikan isi shell aplikasi dari screen reader selama ada page.
   *
   * Elemen yang disembunyikan dicari secara struktural — menaiki leluhur dari host overlay
   * sampai root `wui-app` dan menyembunyikan **saudara** di tiap tingkat. Jadi bukan daftar
   * class yang di-hardcode: topbar, sidenav, dan konten router ikut apa pun nama class-nya.
   *
   * Elemen milik stack sendiri dilewati: `ViewContainerRef` dari `WuiApp` ber-anchor di
   * `.wui-app__overlay-host`, sehingga layer page (dan anchor focus trap milik CDK) justru
   * **saudara** host itu — kalau tidak dilewati, page teratas ikut disembunyikan.
   */
  #hideShellBehind(host: HTMLElement): void {
    const root = host.closest('wui-app') ?? this.#document.body;
    const tersembunyi: HTMLElement[] = [];
    let node: HTMLElement = host;

    while (node !== root && node.parentElement) {
      for (const sibling of Array.from(node.parentElement.children)) {
        const element = sibling as HTMLElement;

        if (sibling !== node && !this.#milikStack(element)) {
          this.#hide(element);
          tersembunyi.push(element);
        }
      }

      node = node.parentElement;
    }

    this.#shellHidden = tersembunyi;
  }

  /** Apakah elemen ini bagian dari tumpukan page (layer atau anchor trap CDK)? */
  #milikStack(element: HTMLElement): boolean {
    return (
      element.classList.contains('wui-page-layer') ||
      element.classList.contains('cdk-focus-trap-anchor')
    );
  }

  /** Kembalikan seluruh elemen shell yang disembunyikan `#hideShellBehind()`. */
  #showShellBehind(): void {
    for (const element of this.#shellHidden) {
      this.#show(element);
    }

    this.#shellHidden = [];
  }

  /** Kembalikan fokus ke elemen pemicu page yang ditutup. */
  #restoreFocus(entry: WuiPageEntry): void {
    const trigger = entry.trigger;
    const layer = entry.layer;
    const active = this.#document.activeElement as HTMLElement | null;

    if (!trigger?.isConnected) {
      return;
    }

    // Kalau navigasi (router) sudah memindahkan fokus ke tempat lain, jangan direbut.
    const fokusDiPage = layer ? layer.contains(active) : true;
    const fokusTidakAda = !active || active === this.#document.body;

    if (!fokusDiPage && !fokusTidakAda) {
      return;
    }

    // Pemicu bisa berada di konten yang sedang disembunyikan (mis. tombol di topbar saat masih
    // ada page lain di atas) — memfokuskan elemen di dalam `aria-hidden` justru pelanggaran a11y.
    if (trigger.closest('[aria-hidden="true"]')) {
      return;
    }

    trigger.focus();
  }

  /** Set `aria-hidden="true"`, sambil mengingat nilai sebelumnya. Idempoten. */
  #hide(element: HTMLElement | null): void {
    if (!element || this.#previousAriaHidden.has(element)) {
      return;
    }

    this.#previousAriaHidden.set(element, element.getAttribute('aria-hidden'));
    element.setAttribute('aria-hidden', 'true');
  }

  /** Kembalikan `aria-hidden` ke nilai semula. Aman dipanggil walau elemennya tidak disembunyikan. */
  #show(element: HTMLElement | null): void {
    if (!element || !this.#previousAriaHidden.has(element)) {
      return;
    }

    const sebelumnya = this.#previousAriaHidden.get(element) ?? null;

    this.#previousAriaHidden.delete(element);

    if (sebelumnya === null) {
      element.removeAttribute('aria-hidden');
    } else {
      element.setAttribute('aria-hidden', sebelumnya);
    }
  }

  /** Elemen anchor host overlay milik `WuiApp` (acuan pencarian shell & struktur DOM). */
  #hostElement(): HTMLElement | null {
    const host = this.#host();

    if (!host) {
      return null;
    }

    // `ViewContainerRef.element` adalah `ElementRef`, bukan elemennya.
    const element = host.element?.nativeElement as unknown;

    return element instanceof HTMLElement ? element : null;
  }
}
