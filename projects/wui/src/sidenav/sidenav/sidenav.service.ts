import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';

import { WuiSidenavOptions, WuiSidenavState } from './sidenav.options';

/** @internal Signal konstan untuk id yang belum terdaftar — tidak perlu membuat signal baru. */
const BELUM_TERDAFTAR: Signal<WuiSidenavState> = signal<WuiSidenavState>('close').asReadonly();

/** @internal Signal turunan per id, dicache supaya aman dipanggil berulang dari template. */
interface WuiSidenavFlags {
  readonly isOpen: Signal<boolean>;
  readonly isMini: Signal<boolean>;
  readonly isClosed: Signal<boolean>;
  readonly isVisible: Signal<boolean>;
}

/**
 * State tiap sidenav, dipisahkan per `id`.
 *
 * Setiap sidenav punya state sendiri (`open` / `close` / `mini`) dan hanya berubah kalau id-nya
 * yang diperintah. Membaca state tidak pernah menulis apa pun, jadi aman dipanggil dari template
 * maupun dari dalam `computed()`.
 *
 * ```ts
 * private readonly sidenav = inject(WuiSidenavService);
 *
 * // dari komponen mana pun — mis. tombol di header
 * protected bukaMenu() { this.sidenav.open('menu-utama'); }
 *
 * // listen state-nya (reaktif, ter-cache per id)
 * protected readonly menuState = this.sidenav.state('menu-utama');
 * protected readonly menuTerbuka = this.sidenav.isOpen('menu-utama');
 * ```
 *
 * Butuh bentuk RxJS? Cukup dibungkus dari sisi pemakai, tanpa menambah dependency di library:
 *
 * ```ts
 * const menuState$ = toObservable(this.sidenav.state('menu-utama')); // @angular/core/rxjs-interop
 * ```
 */
@Injectable({ providedIn: 'root' })
export class WuiSidenavService {
  readonly #states = new Map<string, WritableSignal<WuiSidenavState>>();
  readonly #initial = new Map<string, WuiSidenavState>();
  readonly #flags = new Map<string, WuiSidenavFlags>();
  readonly #ids = signal<readonly string[]>([]);

  /** Id sidenav yang sedang terdaftar. */
  readonly ids: Signal<readonly string[]> = this.#ids.asReadonly();

  /** Id yang sedang tidak tertutup (`open` atau `mini`). Berguna untuk menghitung layout konten. */
  readonly visibleIds: Signal<readonly string[]> = computed(() =>
    this.ids().filter((id) => this.state(id)() !== 'close'),
  );

  /**
   * Signal state untuk satu id.
   *
   * Signal-nya **stabil** — objek yang sama selama id terdaftar — sehingga aman disimpan di field
   * komponen atau dipakai langsung di template. Id yang belum terdaftar selalu bernilai `'close'`.
   */
  state(id: string): Signal<WuiSidenavState> {
    return this.#states.get(id)?.asReadonly() ?? BELUM_TERDAFTAR;
  }

  /** Terbuka penuh. */
  isOpen(id: string): Signal<boolean> {
    return this.#flagsFor(id).isOpen;
  }

  /** Terbuka dalam bentuk ringkas. */
  isMini(id: string): Signal<boolean> {
    return this.#flagsFor(id).isMini;
  }

  /** Tertutup sepenuhnya. */
  isClosed(id: string): Signal<boolean> {
    return this.#flagsFor(id).isClosed;
  }

  /** Terlihat sebagian — terbuka penuh atau ringkas. */
  isVisible(id: string): Signal<boolean> {
    return this.#flagsFor(id).isVisible;
  }

  /**
   * Daftarkan sidenav beserta state awalnya. Dipanggil otomatis oleh `WuiSidenav`.
   * Idempoten: id yang sudah terdaftar tidak ditimpa, jadi state yang sedang berjalan aman.
   */
  register(id: string, options?: WuiSidenavOptions): void {
    if (this.#states.has(id)) {
      return;
    }

    const initial = options?.state ?? 'open';
    this.#states.set(id, signal<WuiSidenavState>(initial));
    this.#initial.set(id, initial);
    this.#flags.delete(id);
    this.#syncIds();
  }

  /** Lepas sidenav beserta state-nya — dipanggil saat komponennya dihancurkan. */
  unregister(id: string): void {
    if (!this.#states.delete(id)) {
      return;
    }

    this.#initial.delete(id);
    this.#flags.delete(id);
    this.#syncIds();
  }

  /** Buka penuh sidenav dengan id tertentu. */
  open(id: string): void {
    this.#set(id, 'open');
  }

  /** Tutup sepenuhnya. */
  close(id: string): void {
    this.#set(id, 'close');
  }

  /** Ubah ke bentuk ringkas (rail). */
  mini(id: string): void {
    this.#set(id, 'mini');
  }

  /**
   * Balikkan `open` ↔ `close` untuk id tertentu.
   * Saat ini `mini`, dianggap "terbuka" sehingga `toggle()` akan menutupnya.
   */
  toggle(id: string): void {
    this.#update(id, (state) => (state === 'close' ? 'open' : 'close'));
  }

  /** Balikkan `mini` ↔ `open` — untuk tombol ringkas/lebarkan. */
  toggleMini(id: string): void {
    this.#update(id, (state) => (state === 'mini' ? 'open' : 'mini'));
  }

  /** Set eksplisit — berguna untuk menyambungkan ke state lain (mis. breakpoint atau query param). */
  setState(id: string, state: WuiSidenavState): void {
    this.#set(id, state);
  }

  /** Kembalikan satu sidenav ke state awalnya saat didaftarkan. */
  reset(id: string): void {
    this.#set(id, this.#initial.get(id) ?? 'open');
  }

  /** Kembalikan semua sidenav ke state awalnya. */
  resetAll(): void {
    for (const id of this.ids()) {
      this.reset(id);
    }
  }

  #set(id: string, state: WuiSidenavState): void {
    const target = this.#states.get(id);

    if (target) {
      target.set(state);
      return;
    }

    // Id belum terdaftar (mis. diperintah sebelum komponennya tampil) → daftarkan otomatis
    // supaya state-nya sudah siap begitu sidenav-nya muncul.
    this.register(id, { state });
  }

  #update(id: string, updater: (state: WuiSidenavState) => WuiSidenavState): void {
    this.#set(id, updater(this.state(id)()));
  }

  #flagsFor(id: string): WuiSidenavFlags {
    let flags = this.#flags.get(id);

    if (!flags) {
      flags = {
        isOpen: computed(() => this.state(id)() === 'open'),
        isMini: computed(() => this.state(id)() === 'mini'),
        isClosed: computed(() => this.state(id)() === 'close'),
        isVisible: computed(() => this.state(id)() !== 'close'),
      };
      this.#flags.set(id, flags);
    }

    return flags;
  }

  #syncIds(): void {
    this.#ids.set([...this.#states.keys()]);
  }
}
