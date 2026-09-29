import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import {
  Overlay,
  OverlayConfig,
  OverlayRef,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  isDevMode,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { WuiFormField } from '../form-field/form-field';
import { WuiInput } from '../form-field/input';
import { WuiIcon } from '../icon/icon';
import { WuiOption } from './option';

/**
 * Path chevron 24×24 (Material Design Icons) yang dipakai panah select.
 *
 * Ditulis sebagai konstanta, bukan lewat pendaftaran ikon aplikasi: library tidak membawa
 * `@mdi/js`, dan sebuah kontrol form tidak boleh menuntut aplikasi mendaftarkan ikon hanya supaya
 * panahnya muncul.
 */
const PANAH_BAWAH = 'M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z';

/** @internal Penomoran id panel. */
let nomorUrut = 0;

/**
 * Select — kontrol pilihan di dalam `<wui-form-field>`.
 *
 * **Fase F2a (sedang berjalan).** Klik pada select membuka **panel kerangka** lewat `cdk/overlay`:
 * kotak dummy setinggi 100px, belum ada opsi. Setelah itu: F2b `<wui-option>` + penanda terpilih,
 * F2c navigasi keyboard, F2d gulir/`[wuiSelectEmpty]` (lihat `docs/planning/wui-select-plan.md` §7).
 *
 * Dua keputusan yang membentuk panelnya:
 *
 * 1. **Panel diperlakukan seperti dialog tanpa backdrop gelap.** Overlay-nya memakai backdrop
 *    **transparan** (`.cdk-overlay-transparent-backdrop` bawaan CDK): seluruh layar tertutup lapisan
 *    yang tak terlihat, jadi interaksi dengan elemen di belakangnya berhenti dan klik di mana pun
 *    di luar panel menutupnya — persis perilaku dialog, hanya tanpa warna gelap. Yang mengunci
 *    gulir halaman bukan `overflow: hidden` yang kita tulis sendiri, melainkan
 *    `scrollStrategies.block()` milik CDK — cara yang sama yang dipakai dialog Material.
 * 2. **Posisi menempel di bawah select-nya, lebar mengikuti field-nya.** Posisi dihitung dari elemen
 *    `<wui-select>` supaya panel tepat di bawah kontrolnya; lebarnya diambil dari elemen
 *    `<wui-form-field>` supaya sama dengan kotak field. Dua acuan ini sengaja dipisah: mengikat
 *    posisi ke field akan menaruh panel di bawah pesan hint/error, bukan di bawah kontrolnya.
 *
 * Dua hal yang menentukan bentuknya sejak F1 (keputusan L1–L9 di plan itu):
 *
 * 1. **Elemen host ini sendiri yang jadi combobox** — ia yang fokusabel (`tabindex`), yang punya
 *    `role="combobox"`, dan nanti yang memegang `aria-activedescendant`. Tidak ada `<button>` di
 *    dalam, jadi tidak ada elemen fokus kedua (L3/L7).
 * 2. **`wuiInput` adalah penandanya.** Directive itu yang menambahkan class `.wui-input` (seluruh
 *    kotak field: tinggi, border, varian `outlined`/`filled`, offset fokus) **dan** yang menulis
 *    `id`/`aria-describedby`/`aria-invalid` dari field (L7). Karena elemen kustom bukan elemen
 *    *labelable*, klik label ditangani `WuiFormField`; karena elemen kustom tidak mengenal
 *    `:placeholder-shown`, keadaan "sudah berisi" ditandai atribut `data-filled` di sini.
 */
@Component({
  selector: 'wui-select',
  imports: [WuiIcon],
  templateUrl: './select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // `wui-select` = susunan isi khusus select, `wui-input` = kotak field yang sudah ada.
    // `wui-input` ditulis di sini juga (bukan hanya oleh `wuiInput`) supaya tampilannya tidak
    // hilang kalau penandanya lupa dipasang — sementara wiring a11y tetap hanya datang dari
    // `wuiInput`, dan itu diperingatkan di constructor kelas ini.
    class: 'wui-select wui-input',
    role: 'combobox',
    'aria-haspopup': 'listbox',
   
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': "disabled() ? 'true' : null",
    '[attr.aria-expanded]': 'terbuka()',
    '[attr.aria-controls]': 'terbuka() ? panelId : null',
    // Dikosongkan saat panel tertutup: id yang menunjuk elemen tak terlihat melanggar aturan
    // "referensi HARUS valid" dan membuat screen reader menyebut opsi yang tidak ada.
    '[attr.aria-activedescendant]': 'aktifId()',
    
    '[attr.data-filled]': 'kosong() ? null : ""',
    '(click)': 'togel()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class WuiSelect {
  readonly #element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #field = inject(WuiFormField, { optional: true });
  readonly #overlay = inject(Overlay);
  readonly #vcr = inject(ViewContainerRef);
  readonly #destroyRef = inject(DestroyRef);

  /** Template panel — tempat opsi milik aplikasi dirender saat panel terbuka. */
  protected readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panel');

  /**
   * Opsi yang ditulis aplikasi di dalam select.
   *
   * `protected` (bukan `#opsi`): query signal Angular tidak boleh diletakkan di anggota yang benar-benar
   * privat — compiler butuh aksesnya untuk memasang query di view. Dibaca dari method biasa, **bukan
   * dari `effect()`**: penanda terpilih diperbarui saat panel dibuka & setelah memilih, jadi tidak ada
   * efek latar yang menulis signal di dalam CD (pola yang dulu diduga membuat halaman beku).
   */
  protected readonly opsi = contentChildren(WuiOption);

  /** Panel overlay: dibuat sekali saat pertama dibuka, lalu dipakai ulang. */
  #ref: OverlayRef | null = null;

  /** Dasar id panel — `aria-controls` host menunjuk ke sini. */
  #idDasar = `wui-select-${++nomorUrut}`;

  /**
   * Pengelola navigasi keyboard. Dibuat saat panel dibuka (dan diperbarui kalau daftar opsinya
   * berubah) — **bukan** lewat `effect()` yang menulis signal di dalam CD, salah satu pola yang dulu
   * diduga membuat halaman beku.
   */
  #manager: ActiveDescendantKeyManager<WuiOption> | null = null;

  /**
   * Daftar opsi yang sedang dipegang key manager.
   *
   * `ListKeyManager` tidak membuka jumlah itemnya ke publik (hanya `activeItem`/
   * `activeItemIndex`), jadi daftarnya disimpan sendiri untuk tahu kapan key manager-nya basi.
   */
  #managerOpsi: readonly WuiOption[] = [];

  /** Id opsi yang sedang ditunjuk — dipasang ke host sebagai `aria-activedescendant`. */
  protected readonly aktifId = signal<string | null>(null);

  /** Pengamat ukuran elemen acuan — hidup hanya selagi panel terbuka. */
  #pengamat?: ResizeObserver;

  /** Satu penyelarasan per frame, walau pengamatnya memicu beruntun saat jendela diseret. */
  #selarasMenunggu = false;

  /** Panel sedang terbuka? */
  protected readonly terbuka = signal(false);

  /** Teks yang tampil saat belum ada pilihan. */
  readonly placeholder = input('');

  /**
   * Nilai terpilih. F3 menggantinya dengan `ControlValueAccessor` (`formControlName`/`ngModel`);
   * sampai itu ada, pemakaian tanpa form memakai input ini.
   */
  readonly value = input<unknown>(null);

  /** Menonaktifkan select. F3: diisi `setDisabledState()` supaya ikut form/`ngModel`. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Cara membandingkan nilai select dengan nilai opsi — perlu saat nilainya objek (hasil API):
   * `[compareWith]="(a, b) => a?.id === b?.id"`.
   */
  readonly compareWith = input<(a: unknown, b: unknown) => boolean>(Object.is);

  /**
   * Nilai berubah karena pilihan user.
   *
   * F3 menggantinya dengan `ControlValueAccessor` supaya bekerja dengan `formControlName`; sampai itu
   * ada, pemakaian tanpa form menulis `[value]` + `(valueChange)`.
   */
  readonly valueChange = output<unknown>();

  /** Belum ada pilihan (null, undefined, atau string kosong) — dipakai untuk `data-filled`. */
  protected readonly kosong = computed(() => {
    const nilai = this.value();

    return nilai === null || nilai === undefined || nilai === '';
  });

  /**
   * Teks yang tampil di kotak: **label opsi** yang nilainya cocok, atau `value` apa adanya kalau
   * tidak ada opsi yang cocok (mis. nilai dari API yang opsinya belum ada), atau placeholder saat kosong.
   */
  protected readonly teks = computed(() => {
    const nilai = this.value();

    if (this.kosong()) {
      return this.placeholder();
    }

    const opsi = this.opsi().find((item) => this.compareWith()(item.nilai, nilai));

    return opsi?.getLabel() ?? String(nilai);
  });

  /** Path panah yang dipakai template. */
  protected readonly panah = PANAH_BAWAH;

  /** Id panel — sasaran `aria-controls` host dan `role="listbox"` di panel. */
  readonly panelId = `${this.#idDasar}-panel`;

  constructor() {
    // Salah pakai yang paling mudah terjadi: kontrol ditulis tanpa penanda `wuiInput`, sehingga
    // field tidak punya id/aria-* untuk dipasang. Diberitahu sekali di mode dev — tanpa penjaga ini
    // gejalanya "select tampak benar tapi label & screen reader tidak terhubung".
    if (isDevMode() && this.#field && !inject(WuiInput, { optional: true })) {
      console.warn(
        '[wui] <wui-select> dipakai di dalam <wui-form-field> tanpa atribut `wuiInput`. ' +
          'Tambahkan `wuiInput` pada elemennya supaya id, aria-describedby, dan aria-invalid terpasang.',
      );
    }

    this.#destroyRef.onDestroy(() => {
      this.#pantauUkuran(false);
      this.#ref?.dispose();
    });
  }

  // ── Buka / tutup panel ─────────────────────────────────────────────────────

  /** Klik di host: buka panel, atau tutup kalau sudah terbuka. */
  protected togel(): void {
    if (this.disabled()) {
      return;
    }

    if (this.terbuka()) {
      this.tutup();
    } else {
      this.buka();
    }
  }

  protected buka(): void {
    const ref = this.#refPanel();

    if (!ref.hasAttached()) {
      ref.attach(new TemplatePortal(this.panelTpl(), this.#vcr));
    }

    // Lebar panel = lebar field-nya (bukan hanya lebar kontrol): keduanya sama ketika select
    // mengisi field (`width: 100%`), tapi field-lah yang tetap benar kalau suatu saat ia punya
    // padding atau kolom sendiri. Posisinya sendiri memakai select-nya (`#asal()`).
    ref.updateSize({ width: `${this.#lebarPanel().offsetWidth}px` });

    this.terbuka.set(true);
    this.#pantauUkuran(true);

    // Penanda terpilih disegarkan setiap panel dibuka — nilai bisa saja berubah dari luar (mis.
    // aplikasi menulis `[value]`), dan opsi bisa saja berbeda dari saat terakhir dibuka.
    this.#tandaiTerpilih();
    this.#siapkanManager();
  }

  protected tutup(): void {
    this.#ref?.detach();
    this.#pantauUkuran(false);

    // Key manager dibuang, tapi penanda item terakhirnya harus dicabut sendiri (lihat
    // `#bersihkanPenunjuk`): CDK tidak mencabutnya lagi begitu manager-nya tidak dipakai.
    this.#manager = null;
    this.#managerOpsi = [];
    this.#bersihkanPenunjuk();

    this.aktifId.set(null);
    this.terbuka.set(false);
  }

  /**
   * Ikuti perubahan ukuran elemen acuan selagi panel terbuka.
   *
   * Lebar panel **dipatok sendiri** saat dibuka, jadi angka itu jadi basi begitu field-nya berubah
   * lebar: jendela di-resize, sidenav dilipat, kolom grid berpindah breakpoint. Posisi saja tidak
   * cukup — konten yang mengecil/melabar mengubah lebar panel, dan lebar panel menentukan keputusan
   * "di bawah atau di atas".
   *
   * Posisi **sudah** ditangani CDK untuk perubahan viewport
   * (`FlexibleConnectedPositionStrategy._resizeSubscription` → `ViewportRuler.change()`, lihat
   * `fesm2022/overlay-module.mjs:1357`), tapi CDK **tidak memakai `ResizeObserver` sama sekali**,
   * jadi perubahan ukuran elemen — termasuk lebar yang kita patok — tidak terdeteksi olehnya.
   */
  #pantauUkuran(aktif: boolean): void {
    if (!aktif) {
      this.#pengamat?.disconnect();
      this.#pengamat = undefined;

      return;
    }

    if (this.#pengamat || typeof ResizeObserver === 'undefined') {
      return;
    }

    // `border-box` supaya yang diamati sama dengan yang dibaca: `offsetWidth`.
    this.#pengamat = new ResizeObserver(() => this.#selaraskanPanel());
    this.#pengamat.observe(this.#lebarPanel(), { box: 'border-box' });
  }

  /** Samakan lebar panel dengan fieldnya, lalu hitung ulang posisinya (urutan ini penting). */
  #selaraskanPanel(): void {
    if (this.#selarasMenunggu) {
      return;
    }

    this.#selarasMenunggu = true;

    // Pengamat bisa memicu berkali-kali dalam satu frame; `requestAnimationFrame` juga cara resmi
    // menghindari "ResizeObserver loop completed with undelivered notifications".
    requestAnimationFrame(() => {
      this.#selarasMenunggu = false;

      const ref = this.#ref;

      if (!ref?.hasAttached()) {
        return;
      }

      // Lebar dulu (ukurannya berubah), baru posisi — supaya perhitungan posisinya memakai lebar
      // yang baru, bukan yang lama.
      ref.updateSize({ width: `${this.#lebarPanel().offsetWidth}px` });
      ref.updatePosition();
    });
  }

  /** Acuan **posisi** panel: kontrolnya sendiri, sehingga panel menempel tepat di bawah select. */
  #asal(): HTMLElement {
    return this.#element.nativeElement;
  }

  /**
   * Acuan **lebar** panel: host `<wui-form-field>` kalau ada, kalau tidak ya select-nya sendiri.
   * Dipisah dari `#asal()` supaya lebar tetap mengikuti kotak field walaupun posisinya dari kontrol.
   */
  #lebarPanel(): HTMLElement {
    return this.#field?.host ?? this.#element.nativeElement;
  }

  #refPanel(): OverlayRef {
    let ref = this.#ref;

    if (!ref) {
      ref = this.#overlay.create(this.#config());

      // Backdrop transparan: seluruh layar tertutup lapisan tak terlihat, jadi klik di mana pun
      // di luar panel berakhir di sini. Itu menggantikan `outsidePointerEvents()` yang dulu dipakai
      // — dan sekaligus menghilangkan kebutuhan penjagaan "klik di host bukan klik luar".
      ref.backdropClick().subscribe(() => this.tutup());

      this.#ref = ref;
    }

    return ref;
  }

  /**
   * Posisi **di bawah select**, dan preset CDK-nya sekaligus memuat varian **di atas** sebagai
   * cadangan — jadi tidak perlu menulis daftar posisi sendiri saat ruang bawah tidak cukup.
   * `withFlexibleDimensions(true)` membiarkan panel menyusut kalau ruangnya mepet, sedangkan
   * `withPush(false)` mencegahnya digeser menimpa trigger-nya sendiri. Ketiganya mengikuti resep yang
   * sudah diukur di spike F0 (plan §9).
   *
   * Dua opsi terakhir menjadikannya "dialog tanpa backdrop gelap":
   * - `hasBackdrop: true` + `backdropClass` transparan → lapisan penutup layar yang tidak terlihat,
   *   sehingga elemen di belakang panel tidak bisa disentuh dan klik di luar menutup panel;
   * - `scrollStrategies.block()` → gulir halaman dikunci, sama seperti dialog Material (CDK membuat
   *   `<html>` `position: fixed` + mempertahankan scrollbar, jadi isinya tidak bergeser).
   */
  #config(): OverlayConfig {
    const posisi = this.#overlay
      .position()
      .flexibleConnectedTo(this.#asal())
      .withPositions(STANDARD_DROPDOWN_BELOW_POSITIONS)
      .withViewportMargin(8)
      .withPush(false)
      .withFlexibleDimensions(true)
      .withGrowAfterOpen(false);

    return {
      positionStrategy: posisi,
      scrollStrategy: this.#overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'wui-select-panel',
    };
  }

  // ── Pemilihan ──────────────────────────────────────────────────────────────

  /**
   * Klik di panel diteruskan ke sini: satu listener untuk semua opsi, bukan satu per opsi.
   *
   * Opsi dicocokkan lewat **elemen host**-nya, bukan lewat id atau indeks — cara itu tetap benar
   * walau opsinya diganti aplikasi (`@for`) atau di dalam panel yang sudah dipindahkan ke `body`.
   */
  protected klikPanel(event: MouseEvent): void {
    const elemen = (event.target as HTMLElement | null)?.closest('wui-option');

    if (!elemen) {
      return;
    }

    const opsi = this.opsi().find((item) => item.host === elemen);

    if (!opsi || opsi.disabled) {
      return;
    }

    this.#tandaiTerpilih(opsi.nilai);
    this.valueChange.emit(opsi.nilai);
    this.tutup();
  }

  /**
   * Perbarui penanda `aria-selected` semua opsi.
   *
   * Dipanggil saat panel dibuka dan setelah memilih — jadi tidak perlu `effect()` yang memantau nilai
   * terus-menerus (dan tidak ada sinyal yang ditulis di dalam efek).
   */
  #tandaiTerpilih(nilai: unknown = this.value()): void {
    const banding = this.compareWith();
    const adaNilai = nilai !== null && nilai !== undefined && nilai !== '';

    for (const opsi of this.opsi()) {
      opsi.tandaiTerpilih(adaNilai && banding(opsi.nilai, nilai));
    }
  }

  // ── Keyboard ───────────────────────────────────────────────────────────────

  /**
   * Peta keyboard (plan §4).
   *
   * Tertutup: **Space** dan **Enter** membuka panel; panah juga (panah bawah sekaligus `Alt+↓`),
   * karena itulah yang diharapkan orang dari sebuah select.
   * Terbuka: panah atas/bawah memindahkan penunjuk opsi (opsi nonaktif dilewati), `Home`/`End` ke
   * ujung, **Enter/Space memilih**, `Esc` menutup tanpa mengubah nilai, `Tab` menutup lalu lanjut
   * pindah field.
   *
   * Fokus **tidak pernah berpindah ke panel** (L3): yang bergerak hanya penunjuknya, dan opsi yang
   * ditunjuk diumumkan lewat `aria-activedescendant` di host.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    if (!this.terbuka()) {
      if (
        event.key === ' ' ||
        event.key === 'Enter' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp'
      ) {
        // Space wajib ditahan: kalau tidak, halaman di belakangnya ikut menggulir.
        event.preventDefault();
        this.buka();
      }

      return;
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.#pilihAktif();
        return;

      case 'Escape':
        event.preventDefault();
        // Jangan sampai Escape juga menutup dialog yang membungkus select ini: listener dialog
        // bekerja di tingkat dokumen, jadi keydown ini harus berhenti di sini.
        event.stopPropagation();
        this.tutup();
        return;

      case 'Tab':
        // Tab memang boleh pindah field; panelnya saja yang ditutup.
        this.tutup();
        return;

      // Tombol yang menggulir dokumen ditahan: halaman ini sudah dikunci `block()`, tapi kontainer
      // gulir di dalamnya tidak — dan tanpa ini `PageUp`/`PageDown` akan menggulir halaman di balik
      // panel. `Home`/`End` ditangani key manager di bawah (jadi tetap ada gunanya).
      case 'PageUp':
      case 'PageDown':
        event.preventDefault();
        return;

      default:
        break;
    }

    // Panah, Home/End: dipindahkan oleh key manager CDK (L10 = b), lalu penandanya disinkronkan.
    this.#pastikanManager();
    this.#manager?.onKeydown(event);
    this.#perbaruiAktif();
  }

  // ── Penunjuk opsi (active descendant) ──────────────────────────────────────

  /** Pilih opsi yang sedang ditunjuk keyboard. */
  #pilihAktif(): void {
    const opsi = this.#manager?.activeItem;

    if (!opsi || opsi.disabled) {
      return;
    }

    this.#tandaiTerpilih(opsi.nilai);
    this.valueChange.emit(opsi.nilai);
    this.tutup();
  }

  /**
   * Cabut semua penanda penunjuk (`.is-active`).
   *
   * `ActiveDescendantKeyManager` hanya mencabut penanda opsi yang **sedang** ia pegang
   * (`setInactiveStyles()` pada item lama sebelum `setActiveStyles()` pada item baru). Begitu
   * manager itu dibuang — panel ditutup — atau diganti dengan yang baru, item terakhirnya tidak
   * pernah dicabut lagi dan penandanya **menumpuk**: buka panel beberapa kali sambil menavigasi,
   * dan dua-tiga opsi ikut tersorot. Karena itu penanda dicabut sendiri dari semua opsi, bukan
   * diandalkan ke CDK.
   */
  #bersihkanPenunjuk(): void {
    for (const opsi of this.opsi()) {
      opsi.setInactiveStyles();
    }
  }

  /**
   * Bangun key manager; item aktif awalnya = opsi terpilih, kalau tidak ada → opsi pertama.
   *
   * Penanda dibersihkan dulu: manager baru tidak tahu apa pun soal opsi yang ditunjuk manager
   * sebelumnya, jadi ia tidak akan mencabut penanda yang tertinggal.
   */
  #siapkanManager(): void {
    const daftar = this.opsi();
    const manager = new ActiveDescendantKeyManager(daftar)
      .withHomeAndEnd()
      .skipPredicate((opsi) => opsi.disabled);

    const terpilih = daftar.findIndex(
      (opsi) => !this.kosong() && this.compareWith()(opsi.nilai, this.value()),
    );
    const pertama = daftar.findIndex((opsi) => !opsi.disabled);
    const awal = terpilih >= 0 ? terpilih : pertama;

    this.#bersihkanPenunjuk();

    if (awal >= 0) {
      manager.setActiveItem(awal);
    }

    this.#manager = manager;
    this.#managerOpsi = daftar;
    this.#perbaruiAktif();
  }

  /** Daftar opsi bisa berubah selagi panel terbuka (`@if`/`@for`): key manager ikut disegarkan. */
  #pastikanManager(): void {
    const daftar = this.opsi();
    const sama =
      this.#manager !== null &&
      this.#managerOpsi.length === daftar.length &&
      this.#managerOpsi.every((item, index) => item === daftar[index]);

    if (!sama) {
      this.#siapkanManager();
    }
  }

  /** Umumkan penunjuk ke host (`aria-activedescendant`) dan pastikan opsinya terlihat. */
  #perbaruiAktif(): void {
    const opsi = this.#manager?.activeItem ?? null;

    this.aktifId.set(opsi?.id ?? null);
    this.#pastikanTerlihat(opsi);
  }

  /**
   * Geser `scrollTop` panel supaya opsi yang ditunjuk terlihat.
   *
   * Sengaja **bukan** `scrollIntoView()`: fungsi itu boleh menggulir semua leluhur yang bisa digulir,
   * termasuk halaman — dan "gulir → reposisi → ..." itu salah satu pola yang dulu diduga membekukan
   * halaman. Menyetel `scrollTop` panel tidak pernah menyentuh apa pun di luar panelnya.
   */
  #pastikanTerlihat(opsi: WuiOption | null): void {
    const panel = this.#ref?.overlayElement.querySelector<HTMLElement>('.wui-select__panel');

    if (!panel || !opsi) {
      return;
    }

    const kotakPanel = panel.getBoundingClientRect();
    const kotakOpsi = opsi.host.getBoundingClientRect();
    const atas = kotakOpsi.top - kotakPanel.top;

    if (atas < 0) {
      panel.scrollTop += atas;
    } else if (atas + kotakOpsi.height > panel.clientHeight) {
      panel.scrollTop += atas + kotakOpsi.height - panel.clientHeight;
    }
  }
}
