import { FocusOrigin } from '@angular/cdk/a11y';
import {
  CdkMenuTriggerBase,
  MENU_STACK,
  MENU_TRIGGER,
  PARENT_OR_NEW_MENU_STACK_PROVIDER,
} from '@angular/cdk/menu';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';

/**
 * Posisi panel: *dropdown below* + offset 2px.
 *
 * Salinan `CONTEXT_MENU_POSITIONS` milik CDK (`fesm2022/menu.mjs:1777-1783`) — konstanta itu
 * **tidak diekspor**, sedangkan `STANDARD_DROPDOWN_BELOW_POSITIONS` diekspor. Alasannya sama
 * dengan CDK: kalau ada submenu, kursor yang berhenti di item pertama bisa langsung membuka
 * submenu tanpa sengaja; offset 2px menjauhkannya dari titik penunjuk.
 */
const POSISI_MENU: ConnectedPosition[] = STANDARD_DROPDOWN_BELOW_POSITIONS.map((posisi) => ({
  ...posisi,
  offsetX: posisi.overlayX === 'start' ? 2 : -2,
  offsetY: posisi.overlayY === 'top' ? 2 : -2,
}));

/**
 * Bagian `CdkMenu` yang dipakai pemicu ini.
 *
 * Instance-nya didapat lewat `childMenu` — diisi sendiri oleh `CdkMenu` (`registerChildMenu()`,
 * `fesm2022/menu.mjs:1442`), jadi tidak perlu query DOM maupun menyentuh anggota internal.
 */
interface MenuDenganItem {
  focusFirstItem(fokus?: FocusOrigin): void;
}

/**
 * Pemicu menu yang sedang terbuka — **hanya satu se-aplikasi**.
 *
 * CDK punya `MenuTracker` untuk ini, tapi ia hanya bekerja untuk trigger CDK (`CdkMenuTrigger` dan
 * `CdkContextMenuTrigger`). Karena overlay-nya kita sendiri (lihat di bawah), penjagaannya
 * sederhana ini yang menggantikannya: membuka menu baru menutup menu yang lama.
 *
 * Aman untuk SSR: hanya ditulis saat interaksi (buka/tutup), bukan saat render.
 */
let pemicuTerbuka: WuiContextMenuTrigger | null = null;

/**
 * `[wuiContextMenu]` — klik kanan (atau long-press di sentuh) membuka menu di titik penunjuk.
 *
 * ```html
 * <div [wuiContextMenu]="menuBaris" [wuiContextMenuData]="{ id: baris.id }">…</div>
 *
 * <ng-template #menuBaris let-data>
 *   <wui-menu>
 *     <wui-menu-item (triggered)="salin(data.id)">Salin</wui-menu-item>
 *   </wui-menu>
 * </ng-template>
 * ```
 *
 * **Overlay-nya milik kita**, bukan `CdkContextMenuTrigger`, karena context menu harus berperilaku
 * seperti panel `<wui-select>`: ada **backdrop transparan** sehingga klik di belakangnya tertahan
 * dan halaman tidak ikut bergulir (terukur: roda gulir di atas backdrop tidak menggeser kontainer
 * gulir halaman, sedangkan pada menu tanpa backdrop ia bergeser — `wui-context-menu-plan.md` §9
 * baris 16–17). `CdkContextMenuTrigger` tidak punya opsi `hasBackdrop` dan overlay-nya tidak bisa
 * disisipi backdrop setelah dibuat.
 *
 * Yang tetap milik CDK: seluruh mesin menunya (`CdkMenu`/`CdkMenuItem`), penutupan lewat `Escape`,
 * `Tab`, dan pengaktifan item — semuanya bekerja lewat `MenuStack` yang sama, yang provisinya
 * dikirim ke template menu lewat injector anak (mekanisme yang sama dengan `_getChildMenuInjector()`
 * milik CDK).
 */
@Directive({
  selector: '[wuiContextMenu]',
  providers: [
    // Dua provider ini yang membuat `<wui-menu>` mengenali kita sebagai pemicunya. Tanpa
    // `MENU_TRIGGER`, `CdkMenu` menganggap dirinya menu *inline* (`fesm2022/menu.mjs:1438`) —
    // perilakunya berbeda (tabindex host, pelacakan fokus) dan itu bukan yang kita mau.
    { provide: MENU_TRIGGER, useExisting: WuiContextMenuTrigger },
    PARENT_OR_NEW_MENU_STACK_PROVIDER,
  ],
  host: {
    '(contextmenu)': 'bukaDariKlikKanan($event)',
  },
  exportAs: 'wuiContextMenu',
  outputs: ['opened', 'closed'],
})
export class WuiContextMenuTrigger extends CdkMenuTriggerBase {
  override close(): void {
      throw new Error('Method not implemented.');
  }
  readonly #overlay = inject(Overlay);
  readonly #element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #injector = inject(Injector);

  /** Template menu — `<ng-template>` yang berisi `<wui-menu>`. */
  readonly wuiContextMenu = input.required<TemplateRef<unknown>>();

  /** Posisi alternatif (daftar `ConnectedPosition`). Tidak diisi = *dropdown below* + offset 2px. */
  readonly wuiContextMenuPosition = input<ConnectedPosition[] | undefined>(undefined);

  /** Data konteks untuk template (`<ng-template #menu let-data>`). */
  readonly wuiContextMenuData = input<unknown>(undefined);

  /**
   * Matikan pemicu.
   *
   * Saat nonaktif, klik kanan **tidak** ditahan — menu bawaan browser kembali muncul, sama seperti
   * perilaku `CdkContextMenuTrigger`.
   */
  readonly wuiContextMenuDisabled = input(false, { transform: booleanAttribute });

  constructor() {
    super();

    inject(DestroyRef).onDestroy(() => {
      if (pemicuTerbuka === this) {
        pemicuTerbuka = null;
      }
    });

    // Panel ditutup dari mana pun (klik item, `Escape`, `Tab`, fokus hilang) selalu lewat stack —
    // jadi cukup satu langganan untuk membereskan tampilannya. Pola yang sama dengan
    // `CdkContextMenuTrigger._setMenuStackCloseListener` (`fesm2022/menu.mjs:1860-1869`).
    this.menuStack.closed.subscribe(({ item }) => {
      if (item === this.childMenu && this.isOpen()) {
        this.#tutupTampilan();
      }
    });
  }

  /**
   * Buka menu di titik layar tertentu.
   *
   * Dipakai sendiri oleh klik kanan; disediakan juga untuk membuka dari kode (mis. tombol "⋯").
   */
  buka(x: number, y: number, fokus: FocusOrigin = 'program'): void {
    if (this.wuiContextMenuDisabled()) {
      return;
    }

    pemicuTerbuka?.tutup();
    pemicuTerbuka = this;

    const ref = this.#pastikanOverlay(x, y);

    ref.updatePosition();
    this.opened.next();
    this.#fokuskanItem(fokus);
  }

  /** Tutup menu (dan kembalikan fokus ke elemen pemicu). */
  tutup(): void {
    if (this.isOpen()) {
      // Menutup lewat stack, supaya isi menu ikut tahu (itulah yang memicu `#tutupTampilan`).
      this.menuStack.closeAll();
    }
  }

  /** Klik kanan / long-press pada elemen pemicu. */
  protected bukaDariKlikKanan(event: MouseEvent): void {
    if (this.wuiContextMenuDisabled()) {
      return;
    }

    // Menu bawaan browser diganti menu kita, dan klik kanan pada elemen bersarang tidak ikut
    // membuka menu elemen luarnya.
    event.preventDefault();
    event.stopPropagation();

    // CDK memakai asal fokus `mouse` untuk klik kanan dan `keyboard` untuk long-press (event
    // `contextmenu` di sentuh datang dengan `button === 0`).
    this.buka(event.clientX, event.clientY, event.button === 2 ? 'mouse' : 'keyboard');
  }

  #pastikanOverlay(x: number, y: number): OverlayRef {
    const posisi = this.overlayRef?.getConfig().positionStrategy;

    if (this.overlayRef && posisi instanceof FlexibleConnectedPositionStrategy) {
      // Dibuka ulang di titik baru: pane-nya dipakai kembali, cukup pindahkan asalnya.
      posisi.setOrigin({ x, y });
    } else {
      this.overlayRef = this.#overlay.create(this.#config(x, y));
      this.overlayRef.backdropClick().subscribe(() => this.tutup());
    }

    this.overlayRef.attach(this.#portal());

    return this.overlayRef;
  }

  #config(x: number, y: number): OverlayConfig {
    return new OverlayConfig({
      // Kombinasi yang sama dengan panel select: backdrop transparan (menahan klik & roda gulir di
      // belakangnya) + `block()` sebagai jaring untuk aplikasi yang menggulir di dokumen.
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'wui-context-menu-panel',
      scrollStrategy: this.#overlay.scrollStrategies.block(),
      positionStrategy: this.#overlay
        .position()
        .flexibleConnectedTo({ x, y })
        // Orientasi dipilih sekali lalu dipertahankan — sama seperti CDK, dan `withGrowAfterOpen`
        // memberi panel kesempatan melebar setelah isinya dirender.
        .withLockedPosition()
        .withGrowAfterOpen()
        .withPositions(this.wuiContextMenuPosition() ?? POSISI_MENU),
    });
  }

  #portal(): TemplatePortal<unknown> {
    // Injector sendiri, bukan rantai elemen pemakainya: inilah yang membuat `CdkMenu` mengenali
    // pemicunya (`MENU_TRIGGER`) dan memakai stack yang sama (`MENU_STACK`) — persis yang dilakukan
    // `CdkMenuTriggerBase._getChildMenuInjector()` (`fesm2022/menu.mjs:317-330`).
    const injector = Injector.create({
      providers: [
        { provide: MENU_TRIGGER, useValue: this },
        { provide: MENU_STACK, useValue: this.menuStack },
      ],
      parent: this.#injector,
    });

    return new TemplatePortal(
      this.wuiContextMenu(),
      this.viewContainerRef,
      { $implicit: this.wuiContextMenuData() },
      injector,
    );
  }

  #fokuskanItem(fokus: FocusOrigin): void {
    const menu = this.childMenu as unknown as MenuDenganItem | undefined;

    // `focusFirstItem` juga memasang item aktif di key manager CDK — jadi panah, `Home`/`End`, dan
    // type-ahead bekerja sejak tombol pertama ditekan.
    menu?.focusFirstItem(fokus);
  }

  #tutupTampilan(): void {
    this.overlayRef?.detach();

    if (pemicuTerbuka === this) {
      pemicuTerbuka = null;
    }

    this.closed.next();
    this.#pulihkanFokus();
  }

  /**
   * Kembalikan fokus ke elemen pemicu.
   *
   * CDK **tidak** melakukannya untuk menu konteks: item yang difokus ikut hilang bersama panelnya,
   * sehingga fokus mendarat di `<body>` (terukur, `wui-context-menu-plan.md` §9 baris 5). Fokus
   * hanya diambil kalau memang sedang di dalam panel atau sudah lepas ke `body` — supaya klik di
   * elemen lain (yang memang sudah memindahkan fokus) tidak direbut.
   */
  #pulihkanFokus(): void {
    const aktif = document.activeElement;
    const perluDipulihkan =
      !aktif || aktif === document.body || !!this.overlayRef?.overlayElement.contains(aktif);

    if (perluDipulihkan) {
      this.#element.nativeElement.focus({ preventScroll: true });
    }
  }
}
