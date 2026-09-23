# Planning — Context menu (`wui-menu` + `[wuiContextMenu]`)

> Tujuan: **menu konteks** ala design system sendiri — klik kanan (atau long-press di sentuh) pada
> sebuah elemen memunculkan panel menu Melayang di titik penunjuk, dengan item yang bisa dinavigasi
> keyboard, nonaktif, dan punya slot bebas (ikon/teks bantu) — tanpa menambah dependency baru dan
> tanpa mengambil bahasa visual dari pustaka lain.

Status: **F0 ✅ terukur 23 Sep 2026** (18 baris hasil di §9) · **F1 ✅ ditulis 23 Sep 2026**
(kode + token M3 + demo `/context-menu`) — **belum dibuild dan belum diuji**: pengetesan milik user
(`AGENTS.md` §1), dan dua asumsi pembungkus `hostDirectives` baru bisa dipastikan saat dijalankan
(§8 no. 10–11). Keputusan **N1–N2 & N6–N12 disetujui user 23 Sep 2026**;
**N3 & N5 direvisi 23 Sep 2026** — user memutuskan context menu harus **berperilaku seperti panel
select**: **`[wuiContextMenu]` membuat overlay-nya sendiri** dengan **backdrop transparan**, dan
`Esc` menutup **satu tingkat saja**. Yang tidak lagi diperlukan: `block()` sebagai andalan gulir
(backdrop sudah menahannya — terukur, §9 baris 16–17) dan pembekuan kontainer gulir leluhur.
**Belum ada kode library.** Semua pengetesan/pengukuran lain **dilakukan manual oleh user**
(`AGENTS.md` §1); sesi Playwright 23 Sep 2026 dijalankan **atas izin khusus user untuk F0 saja**.

Prefix keputusan **N** (dari me**N**u; `M` sudah dipakai `wui-color-mtb-plan.md`). Jangan dicampur
dengan `K` (form controls), `L` (select), `C`/`S` (plan warna lama), `G`, `B`, `U`.

| Dokumen | Hubungan |
| --- | --- |
| `docs/planning/wui-select-plan.md` | Pola overlay yang dipakai ulang: panel = permukaan `cdk/overlay`, dua aturan kemenangan CSS, dan **pelajaran hang** (jangan menulis algoritma/efek sendiri yang tidak perlu) |
| `docs/planning/wui-dialog-plan.md` | Sumber pola `cdk/overlay` + `.cdk-overlay-pane.wui-*` dan `--wui-z-dialog` |
| `docs/panduan-warna.md` | Peran warna permukaan & item (`surface-container*`, `on-surface`, `on-surface-variant`) dan state layer |
| `docs/panduan-scss.md` | Struktur layer, `a.space(...)`, token, jebakan stylelint |
| `docs/panduan-komponen.md` | Tempat dokumentasi per komponen ditulis (fase F7) |

---

## 0. Jawaban singkat

**Bisa, tanpa dependency baru.** `@angular/cdk@^20.2.14` sudah jadi `dependencies`; yang bertambah
hanya **entry point baru** `@angular/cdk/menu` — modul ini sudah ada di `node_modules` dan tidak
membawa satu baris CSS pun (lihat §2), jadi tampilannya sepenuhnya milik kita.

Bentuk akhir yang diusulkan:

```html
<!-- pemicu: boleh elemen apa pun, termasuk baris tabel -->
<div [wuiContextMenu]="menuBaris" [wuiContextMenuData]="{ id: baris.id }">…</div>

<ng-template #menuBaris let-data>
  <wui-menu>
    <wui-menu-item (triggered)="salin(data.id)">
      <wui-icon name="content-copy" /> Salin
    </wui-menu-item>
    <wui-menu-item (triggered)="ubah(data.id)">Ubah</wui-menu-item>
    <hr wuiMenuDivider />
    <wui-menu-item [disabled]="true">Hapus</wui-menu-item>
  </wui-menu>
</ng-template>
```

Tiga poin kuncinya:

1. **Mesin menu = CDK, tapi trigger (overlay) = kita** (N2 + N3 revisi 23 Sep 2026). `cdk/menu`
   menyelesaikan bagian yang mahal & mudah salah: `MenuStack` (buka/tutup bertingkat), *roving
   tabindex*, type-ahead, wrap, Home/End, Escape/Tab, dan hover-intent submenu (`MenuAim`). Yang
   **tidak** diberikannya: CSS (N9) dan **backdrop** — sedangkan context menu kita harus berperilaku
   seperti panel select (klik & gulir belakang tertahan, `Esc` satu tingkat), jadi overlay-nya kita
   tulis sendiri di `[wuiContextMenu]` dengan `cdk/overlay` (resep panel select, §3.3–§3.4).
2. **Permukaannya tetap `wui-*`** (N3) — `wui-menu`, `wui-menu-item`, `[wuiMenuDivider]`,
   `[wuiContextMenu]`. Aplikasi tidak perlu tahu `cdk*`; yang berubah hanya isi pembungkusnya.
3. **Yang kita kerjakan**: gaya/token (§3.5), dokumen, demo, dan tiga hal yang CDK tidak
   menyelesaikannya sendiri — posisi & flip (§3.4), strategi gulir (N5), dan pemulihan fokus (§4).

---

## 1. Yang diwarisi dari plan lain (jangan dibuka lagi)

| Sumber | Yang diwarisi |
| --- | --- |
| K7 (`wui-form-controls-plan.md`) | Tetap **CDK, bukan `@angular/material`** — satu sistem tema, satu bahasa visual |
| Dialog | Panel Melayang hidup di `cdk/overlay` (`.cdk-overlay-container`), bukan `position: absolute`; penimpaan gaya CDK lewat `.cdk-overlay-pane.wui-*` |
| Select §3.4 | **Panel dibangun sekali** lalu `attach`/`detach`; jangan hancur-bangun tiap buka |
| Select §8 | Jebakan yang sama berlaku: `ng-content`, `z-index`, RTL, zoneless, SSR, dist/tipe, jebakan lint |
| Select (pelajaran) | **Jangan menulis sendiri** yang sudah ada & teruji di CDK — hang F2 dulu muncul dari rangkaian yang kita tulis sendiri (efek latar, key manager buatan, `scrollIntoView`) |
| `AGENTS.md` §1 | Agent **tidak** menjalankan build/lint/uji tanpa perintah user |

**Satu hal yang sengaja TIDAK diwarisi**: model fokus. Select memakai *active descendant* (L3) supaya
fokus tidak pernah meninggalkan host; **menu memakai fokus DOM pindah ke item** (N7). Itu bukan
inkonsistensi yang tidak sengaja: ARIA `menu` memang pola *roving tabindex* (item difokus), sedangkan
`listbox` boleh keduanya — dan CDK menu sudah mengasumsikan yang pertama (lihat §2).

---

## 2. Fakta CDK (dibaca langsung dari `node_modules/@angular/cdk` versi repo)

Berkas rujukan: `M` = `node_modules/@angular/cdk/fesm2022/menu.mjs`,
`D` = `node_modules/@angular/cdk/menu/index.d.ts`,
`O` = `node_modules/@angular/cdk/fesm2022/overlay-module.mjs`.

| Yang dicari | Hasil |
| --- | --- |
| Entry point | `@angular/cdk/menu` ada, isinya **hanya** `index.d.ts` + bundel `fesm2022/menu.mjs`. Ekspor: `CdkMenu`, `CdkMenuBar`, `CdkMenuItem`, `CdkMenuItemRadio`, `CdkMenuItemCheckbox`, `CdkMenuGroup`, `CdkMenuTrigger`, `CdkContextMenuTrigger`, `CdkTargetMenuAim`, `MenuStack`, `MenuTracker`, `MENU_STACK`, `MENU_TRIGGER`, `CDK_MENU`, `MENU_AIM`, `MENU_SCROLL_STRATEGY`, `PARENT_OR_NEW_MENU_STACK_PROVIDER`, `PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER` (`D:833-834`) |
| **Style bawaan** | **Nol.** Tidak ada `.scss`/`.css` menu di paket; `menu.mjs` tidak punya `styles:`, dan `node_modules/@angular/cdk/_index.scss:1-7` hanya mem-`@forward` `overlay`, `a11y`, `text-field`. Kedelapan nama class CDK (`cdk-menu`, `cdk-menu-item`, …) hanya muncul sebagai string host-binding di JS. Artinya: **tata letak vertical, padding, warna, elevasi = tugas kita** |
| Class & peran host | `CdkMenu`: `class="cdk-menu"` (+`cdk-menu-inline` saat inline), `role="menu"`, `[attr.aria-orientation]`, `[id]`, `data-cdk-menu-stack-id` (`M:1515-1529`) · `CdkMenuItem`: `class="cdk-menu-item"` (+`cdk-menu-item-disabled`), `role="menuitem"`, `[tabindex]`, `[attr.aria-disabled]` (`M:1123-1140`) · `CdkMenuItemRadio`: `role="menuitemradio"` · `CdkMenuItemCheckbox`: `role="menuitemcheckbox"` · `CdkContextMenuTrigger`: **tanpa** class/role/aria sendiri, hanya `(contextmenu)` + `data-cdk-menu-stack-id` (`M:1935-1939`) |
| Input/output publik (nama yang wajib dikutip apa adanya) | `CdkMenuItem`: `cdkMenuItemDisabled` (**punya transform `booleanAttribute`**, `M:1123` — jadi `<wui-menu-item disabled>` seharusnya bekerja), `cdkMenuitemTypeaheadLabel` (**huruf `i` kecil di "Menuitem"** — mudah salah tulis), output `cdkMenuItemTriggered`, `exportAs: 'cdkMenuItem'` (`D:552`) · `CdkMenu`: input `id` (warisan `CdkMenuBase`), output `closed`, `exportAs: 'cdkMenu'` (`D:708`, `D:645`) · `CdkContextMenuTrigger`: `cdkContextMenuTriggerFor`, `cdkContextMenuPosition`, `cdkContextMenuTriggerData`, `cdkContextMenuDisabled`, output `cdkContextMenuOpened`/`cdkContextMenuClosed`, `exportAs: 'cdkContextMenuTriggerFor'` (`D:822`); ia menyediakan `MENU_TRIGGER` + **`MENU_STACK` miliknya sendiri** (`M:1938-1941`) |
| Peta keyboard | `FocusKeyManager(this.items).withWrap().withTypeAhead().withHomeAndEnd().skipPredicate(() => false)` (`M:1333-1338`) ⇒ **panah, Home/End, type-ahead, wrap** ditangani key manager; **Escape** & **Tab** oleh `CdkMenu._handleKeyEvent` (`M:1456-1487`); **Enter/Space** & panah kiri/kanan (submenu) oleh `CdkMenuItem._onKeydown` (`M:1011-1053`) |
| Item nonaktif | `skipPredicate(() => false)` ⇒ panah **tetap mendarat** di item `disabled` (hanya tidak bisa di-Enter). Tidak bisa diubah dari luar: `keyManager` **protected** dan `_setKeyManager()` **private** (`D:592`). Diterima, dicatat (§8 no. 5) |
| Fokus | Fokus DOM **pindah ke item**: `focusFirstItem('mouse' | 'keyboard' | 'program')` dipanggil saat menu dibuka, bergantung `event.button` (`M:1831-1839`); item yang difokus menulis `tabindex="0"`, saat blur kembali `-1` (`M:977-993`). Saat menu tertutup, fokus **kembali ke elemen pemicu** (`M:823-830`) |
| Konfigurasi overlay pemicu konteks | `_getOverlayConfig()` hanya mengisi `positionStrategy`, `scrollStrategy`, `direction` (`M:1842-1848`) ⇒ **tanpa `hasBackdrop`**, tanpa `panelClass`. `direction` diisi **instance `Directionality`**, bukan string — tipe `OverlayConfig.direction` memang menerima keduanya (`overlay/index.d.ts:265`). **Tidak dipakai lagi sejak N3 direvisi** (23 Sep 2026) — dicatat sebagai resep: yang kita tulis sendiri harus mengisi `hasBackdrop` + backdrop transparan + `panelClass` |
| Strategi posisi | `FlexibleConnectedPositionStrategy` dengan **origin berupa titik** `{x,y}` (diperlakukan sebagai kotak 0×0, `O:2160-2185`), `.withLockedPosition()`, `.withGrowAfterOpen()`, posisi bawaan `CONTEXT_MENU_POSITIONS` = *dropdown below* (bawah/atas × start/end) **+ offset 2px** (`M:1777-1783`). `withPush` & dimensi fleksibel **aktif bawaan** (`O:1276`, `O:1282`) ⇒ menu **di-flip dan di-push** agar tetap di dalam jendela (`O:2115-2160`) |
| Strategi gulir bawaan | `MENU_SCROLL_STRATEGY` = `reposition()` (root factory, `M:206-213`). ⚠️ Terukur 23 Sep 2026: `reposition()` hanya bereaksi pada gulir **leluhur overlay** (dokumen) — kalau yang menggulir kontainer **di dalam** halaman, panel diam di tempat (§9 baris 12). Dan `block()` **no-op** di layout kita: `BlockScrollStrategy._canBeEnabled()` (`overlay-module.mjs:89-101`) mensyaratkan `<html>` sendiri yang menggulir (§9 baris 11) |
| Buka/tutup | Tutup lewat: klik luar (`_subscribeToOutsideClicks`, `M:793-812`), Escape, Tab, item di-trigger (`M:948-957`), atau menu kehilangan fokus (`M:813-820`). `MenuTracker.update()` menutup menu top-level lain **se-app** (`M:214-233`) |
| Daftar item | `ContentChildren(CdkMenuItem, { descendants: true })` (`M:1417-1419`) lalu **disaring** `item._parentMenu === this` (`M:1322-1331`) ⇒ item boleh dibungkus elemen lain (grup) tanpa merusak daftar |
| `hostDirectives` + query | **Query melihat directive yang dipasang lewat `hostDirectives`**: def host directive ikut dimasukkan ke daftar def node (`@angular/core/fesm2022/debug_node.mjs:16973-16974`) dan pencocokan query berjalan atas rentang `directiveStart…directiveEnd` (`debug_node.mjs:15578`, `:1927-1932`). Jadi `ContentChildren(CdkMenuItem)` milik `CdkMenu` **akan menemukan** `CdkMenuItem` yang dipasang di `<wui-menu-item>` |
| Menautkan trigger sendiri ke menu | `CdkMenuTriggerBase` **memang disediakan untuk diperluas** (“extendable to create custom menu trigger types”, `D:556-560`), dan CDK sendiri menautkan trigger↔menu lewat dua jalur publik: (1) menu meng-`inject(MENU_TRIGGER)` lalu memanggil `registerChildMenu(this)` (`M:1432`, `M:1442`) — inilah yang mengisi `childMenu` di trigger; (2) template menu dititipkan sebuah **injector anak** berisi `MENU_TRIGGER` + `MENU_STACK` (`_getChildMenuInjector()`, `M:317-330`). Trigger kita meniru keduanya, jadi tidak ada query DOM maupun anggota internal yang disentuh. Tanpa provider `MENU_TRIGGER`, `CdkMenu` menganggap dirinya menu **inline** (`isInline = !_parentTrigger`, `M:1438`) |
| Risiko `hostDirectives` | Tidak bisa: directive non-standalone, **component**, ekspos binding yang tidak ada, alias ganda, atau tidak mengekspos input `required`; juga harus identifier polos (bukan `forwardRef`). Tidak ada larangan soal query/DI di dokumentasi yang terpasang (`@angular/core/discovery.d.d.ts:4969-4977`) |

**Catatan penting yang harus diingat saat memberi nama (N3)**: pemetaan `inputs`/`outputs` pada
`hostDirectives` **memakai nama publik CDK**, bukan nama properti TypeScript — jadi yang benar
`outputs: ['cdkMenuItemTriggered: triggered']`, dan `'triggered: …'` akan gagal dengan
`HOST_DIRECTIVE_UNDEFINED_BINDING`.

---

## 3. Arsitektur

### 3.1 Berkas

| Berkas | Isi |
| --- | --- |
| `projects/wui/src/menu/menu.ts` | `WuiMenu` — `selector: 'wui-menu'`, template `<ng-content />`, `hostDirectives: [CdkMenu]`, host `class: 'wui-menu'` |
| `projects/wui/src/menu/menu-item.ts` | `WuiMenuItem` — `selector: 'wui-menu-item'`, template `<ng-content />`, `hostDirectives: [{ directive: CdkMenuItem, inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuitemTypeaheadLabel: typeaheadLabel'], outputs: ['cdkMenuItemTriggered: triggered'] }]` |
| `projects/wui/src/menu/menu-divider.ts` | `WuiMenuDivider` — `selector: '[wuiMenuDivider]'`, host `class: 'wui-menu-divider'`, dipakai di `<hr>` (pola yang sama dengan `[wuiSidenavDivider]`) |
| `projects/wui/src/menu/context-menu.ts` | `WuiContextMenuTrigger` — `selector: '[wuiContextMenu]'`, `hostDirectives: [CdkContextMenuTrigger]`, **`providers` menimpa `MENU_SCROLL_STRATEGY`** (N5) + method `buka(x, y)`/`tutup()` |
| `projects/wui/scss/components/_menu.scss` | Seluruh gaya `.wui-menu*` (N9) |
| `projects/wui/scss/components/_index.scss` | `+ @forward 'menu';` (satu baris) |
| `projects/wui/scss/wui.scss` | `+ @include components.menu;` (satu baris, setelah `components.select`) |
| `projects/wui/scss/abstracts/_tokens.scss` | Token `$wui-menu-*` (§3.5) |
| `projects/wui/scss/themes/_light-theme.scss` | Emisi `--wui-menu-*` (pola yang sama dengan `--wui-select-*`, `themes/_light-theme.scss:59-62`) |
| `projects/wui/src/public-api.ts` | 4 ekspor baru (`menu`, `menu-item`, `menu-divider`, `context-menu`) |
| `src/app/pages/context-menu/context-menu.page/*` | Demo `/context-menu` (sekaligus dokumentasi hidup) |
| `src/app/pages/context-menu-spike/*` | **Hanya untuk F0** — harness pengukuran, kode sekali pakai (pola `select-spike`) |
| `src/app/app.routes.ts`, `src/app/app.html` | Rute `/context-menu` (+ `/context-menu-spike` sementara) dan tautan sidenav |
| `docs/panduan-komponen.md`, `projects/wui/README.md` | Bagian "Menu" (fase F7) |

### 3.2 DOM & peran (yang akhirnya ada di browser)

```html
<!-- di dalam .cdk-overlay-container -->
<div class="cdk-overlay-pane">            <!-- pane CDK, z-index 1000, flex -->
  <wui-menu class="wui-menu cdk-menu" role="menu" aria-orientation="vertical" data-cdk-menu-stack-id="…">
    <wui-menu-item class="wui-menu-item cdk-menu-item" role="menuitem" tabindex="0" aria-disabled="…">…</wui-menu-item>
    <hr class="wui-menu-divider" />
    …
  </wui-menu>
</div>
```

Dua hal yang **wajib** (sama seperti jebakan panel select §3.5): pane CDK adalah *flex container*,
jadi `.wui-menu` butuh lebar sendiri (`min-width`/`max-width` token) — kalau tidak, panel menyusut
mengikuti padding; dan proyeksi `ng-content` berarti item hidup di DOM terang `<wui-menu>`.

### 3.3 Permukaan API kita

| Selektor | Input | Output | Method |
| --- | --- | --- | --- |
| `wui-menu` (`WuiMenu`) | — (v1) | — | — |
| `wui-menu-item` (`WuiMenuItem`) | `disabled` (→ `cdkMenuItemDisabled`, transform `booleanAttribute` milik CDK), `typeaheadLabel` | `triggered` | — |
| `[wuiMenuDivider]` (`WuiMenuDivider`) | — | — | — |
| `[wuiContextMenu]` (`WuiContextMenuTrigger`) | `wuiContextMenu` (TemplateRef), `wuiContextMenuPosition`, `wuiContextMenuData`, `wuiContextMenuDisabled` | `opened`, `closed` | `buka(x, y)`, `tutup()` |

**Konsekuensi revisi N3 (23 Sep 2026)** — karena `[wuiContextMenu]` yang membuat overlay-nya sendiri
(pola panel select), ada tiga hal yang tadi "gratis" dari CDK dan kini menjadi kewajiban kita
(ketiganya kecil, ~15 baris masing-masing):

1. **Backdrop + `block()`** ada di konfigurasi overlay kita: `hasBackdrop: true`,
   `backdropClass: 'cdk-overlay-transparent-backdrop'`, `scrollStrategies.block()`. Inilah yang
   memberi "klik & gulir belakang tertahan" (terukur §9 baris 16–17).
2. **Satu menu aktif se-aplikasi** — `MenuTracker` CDK hanya bekerja untuk trigger CDK, jadi kita
   menyimpan referensi menu teratas di satu service kecil dan menutupnya saat menu baru dibuka
   (perilaku terukur yang ingin dipertahankan: `MenuTracker` menutup menu top-level lain se-app).
3. **Penutupan & fokus** — reaksi `menuStack.closed` untuk `detach()` overlay, plus **pemulihan fokus
   ke elemen pemicu** (§4 kewajiban 1). Perilaku keyboard/klik-luar/Esc tetap milik CDK
   (`CdkMenu`, `MenuStack`, key manager) — yang kita tulis hanya *trigger*-nya.

Harga yang dibayar (dicatat supaya sadar): posisi titik + flip/push juga jadi milik kita — resepnya
sudah terbaca di F0 select & menu: `flexibleConnectedTo({x, y})` + `withLockedPosition()` +
`withGrowAfterOpen()` + daftar posisi *dropdown below* **+ offset 2px** (meniru
`CONTEXT_MENU_POSITIONS`, `M:1777-1783`; salinannya kita tulis sendiri karena konstanta itu tidak
diekspor CDK — `STANDARD_DROPDOWN_BELOW_POSITIONS` yang diekspor ✓).

**Tidak** diekspos di v1 dengan sengaja:

- `orientation` pada `wui-menu`. Properti `orientation` di `CdkMenuBase` publik, **tapi key manager
  dibangun sekali** saat `ngAfterContentInit` (`M:1333-1338`) ⇒ mengubahnya belakangan tidak
  memindahkan arah navigasi. Horizontal hanya relevan untuk menu bar (fase lain).
- `checked`/`cdkMenuItemChecked`, `cdkMenuItemRadio`/`Checkbox`, submenu ⇒ fase F4/F5 (butuh
  pembungkus tambahan masing-masing).
- Konfigurasi gaya per-item (mis. `danger`): tunggu angka & kebutuhan nyata dari desain.

### 3.4 Siklus hidup, posisi, dan penutupan

- **Overlay dibuat sekali** oleh `[wuiContextMenu]` dan dipakai ulang (pola panel select §3.4);
  dibuka ulang di titik baru cukup `setOrigin({x, y})` + `updatePosition()`. Tidak ada hancur-bangun.
- **Posisi**: *dropdown below* + offset 2px, flip ke atas **dan** push ke dalam jendela (N6) —
  ditulis sendiri di strategy kita (resep identik dengan CDK, lihat §3.3). Aplikasi bisa menimpanya
  lewat `[wuiContextMenuPosition]`.
- **Gulir & klik belakang**: **backdrop transparan** yang menahan keduanya (keputusan user 23 Sep
  2026). Terukur (§9 baris 16–17): roda gulir di atas backdrop **tidak** menggeser
  `.wui-page-content`, sedangkan roda di atas halaman saat menu tanpa backdrop **menggesernya**.
  `block()` tetap dipasang — ia benar untuk aplikasi yang menggulir di dokumen, dan tidak
  membahayakan di layout kita; yang menahan gulir di layout ini adalah backdrop.
- **Penutupan**: `backdropClick()`, Escape, Tab, item di-klik, menu kehilangan fokus. **Escape
  menutup satu tingkat saja** (keputusan user 23 Sep 2026): `WuiMenu` memanggil `stopPropagation()`
  sehingga dialog/page di bawahnya tidak ikut tertutup — jebakan yang sama seperti panel select.
- **Klik kanan**: `preventDefault()` + `stopPropagation()` kita yang pasang (tiruan `M:1816-1840`),
  jadi menu bawaan browser hilang dan hanya menu terdekat yang terbuka. `stopPropagation()` juga
  berarti menu bersarang tidak ikut terbuka saat klik kanan pada baris di dalam baris lain.

### 3.5 Gaya & token

Angka diambil dari **spesifikasi Material 3** (*Menus* → *Menu (baseline)* → *Measurements*) dan
token `md.comp.menu.*` Material Web — keduanya sepakat. Ditulis di `abstracts/_tokens.scss`, di-emisikan
di `themes/_light-theme.scss` mengikuti pola select:

| Token | Nilai | Sumber |
| --- | --- | --- |
| `$wui-menu-min-width` | `112px` | “Container width 112dp min” |
| `$wui-menu-max-width` | `280px` | idem (“280dp max”) |
| `$wui-menu-radius` | `4px` | “Corner radius 4dp” + `md.comp.menu.container.shape` = *corner-extra-small* |
| `$wui-menu-item-height` | `48px` | “List item height 48dp” + `md.comp.menu.list-item.container.height` |
| `$wui-menu-item-padding-inline` | `12px` | “Left/right padding 12dp” |
| `$wui-menu-item-gap` | `12px` | “Padding between elements within a list item 12dp” |
| `$wui-menu-icon-size` | `24px` | “Leading/trailing icon size 24dp” |
| `$wui-menu-divider-height` | `1px` | “Divider height 1dp” |
| `$wui-menu-max-height` | `calc(100dvh - 16px)` | M3 tidak menyebutnya; Material Web memakai `calc(100% - 32px)` relatif jendela |
| `$wui-menu-elevation` | elevasi M3 **level 2** | `md.comp.menu.container.elevation` = `md-sys-elevation.level2` |

Dua angka M3 lain **tidak** jadi token karena kebetulan sama dengan langkah skala spasi repo:
bantalan atas/bawah panel 8dp = `a.space(py, 2)` dan jarak pemisah 8dp = `a.space(my, 2)`. Sebaliknya
**12dp tidak ada di skala repo** (0 · 4 · 8 · 16 · 24), jadi padding kiri/kanan item dan jarak
ikon↔label tetap lewat token `--wui-menu-*` — bukan `a.space()`.

Peran warna **tanpa peran baru** (konsisten dengan panel select dan peran M3 yang sama):

- permukaan panel: `--wui-color-surface-container` + `$wui-menu-elevation`;
- teks item: `--wui-color-on-surface`; ikon/keterangan: `--wui-color-on-surface-variant`;
- hover: `--wui-color-surface-container-high`; item yang difokus keyboard: `--wui-color-surface-container-highest`;
- item nonaktif: `--wui-disabled-content-opacity` di atas `on-surface` (pola tombol/label nonaktif).

Aturan penataan yang harus dipatuhi (jebakan lint repo): pakai mixin `a.space(...)` (bukan
`padding-*` mentah), tanpa `!important`, nesting maksimal 3, class hanya `wui-*` / `.is-*` / `.cdk-*`,
semua variabel lokal berawalan `$wui-`. **Highlight item bukan `.is-active`** seperti select:
di sini item benar-benar difokus DOM, jadi aturannya `:hover` (mouse) dan `:focus-visible`
(keyboard) — sekaligus memberi indikator fokus yang terlihat (jangan `outline: none` tanpa
pengganti).

---

## 4. Kontrak a11y (target + yang sudah terukur di F0)

| Elemen | Atribut (bawaan CDK, **jangan** ditulis ulang di template aplikasi) |
| --- | --- |
| `<wui-menu>` | `role="menu"`, `aria-orientation="vertical"`, `id`, `data-cdk-menu-stack-id` |
| `<wui-menu-item>` | `role="menuitem"`, `tabindex` (`0` hanya pada item yang sedang difokus), `aria-disabled` |
| panel/pane | tanpa role tambahan; pane CDK hanya kotak |
| pemicu | `[wuiContextMenu]` **tidak** menambah `aria-haspopup`/`aria-expanded` (berbeda dari `CdkMenuTrigger` yang menambahkannya, `M:859-861`) — menunya tidak punya tombol pemicu, jadi tidak ada yang perlu diumumkan. Kalau aplikasi mau, ia bisa menambahkan sendiri |

**Dua kewajiban yang lahir dari F0** (bukan bawaan CDK):

1. **Fokus dikembalikan ke elemen pemicu saat menu tertutup.** Terukur: CDK meninggalkan fokus di
   `<body>` (baris 5), sedangkan `CdkMenuTrigger` versi dropdown memang mengembalikannya — untuk
   pemicu konteks tidak ada kode itu (`_setMenuStackCloseListener` hanya menutup, `M:1860-1869`).
   Rencana: `[wuiContextMenu]` memulihkan fokus pada `(closed)` **hanya** kalau fokus memang ada di
   item menu (jangan rebut fokus kalau pengguna mengklik elemen lain — terukur: klik di luar panel
   memang sudah memindahkan fokus ke elemen yang diklik, dan itu benar).
2. **`Escape` harus `stopPropagation()`** — **diputuskan user 23 Sep 2026**: `Esc` menutup **satu
   tingkat saja** (context menu), seperti panel select. Terukur: tanpa itu satu `Esc` menutup menu
   **dan** dialognya (baris 6), karena listener dialog bekerja di tingkat dokumen. `WuiMenu`
   menambahkan host listener yang memanggil `stopPropagation()` di elemen menu — aman terhadap
   handler CDK di elemen yang sama, karena `stopPropagation()` tidak menghentikan listener lain di
   elemen itu (`stopImmediatePropagation` yang menghentikan).
3. **Backdrop menahan klik & gulir di belakang** — **diputuskan user 23 Sep 2026**: context menu
   memakai **backdrop transparan** seperti panel select, sehingga elemen di belakang tidak bereaksi
   dan halaman tidak bergeser. Terukur (§9 baris 16–17): backdrop **menahan roda gulir** pada
   kontainer gulir dalam (`.wui-page-content` tidak bergerak), sedangkan tanpa backdrop ia bergeser
   832 → 1232. Cakupan yang **tidak** ditahan: gulir terprogram (`el.scrollTop = …`) dan tombol
   keyboard di luar menu — keduanya di luar urusan panel.

Peta tombol (semuanya bawaan CDK — daftar ini untuk daftar periksa, bukan untuk diimplementasikan):

| Tombol | Perilaku |
| --- | --- |
| klik kanan / long-press | buka menu di titik penunjuk; item pertama difokus |
| ↓ / ↑ | pindah item (wrap di ujung) — **tidak melewati** item nonaktif (§8 no. 5) |
| Home / End | item pertama / terakhir |
| huruf | type-ahead (label = `typeaheadLabel` ?? teks item) ✅ terukur |
| Enter / Space | aktifkan item → `(triggered)` → menu tertutup ✅ terukur; fokus **kita** kembalikan ke pemicu |
| Esc | tutup **tanpa** mengaktifkan ✅ terukur; `stopPropagation()` wajib; fokus **kita** kembalikan |
| Tab | tutup menu stack (belum diukur — masuk F2) |
| → / ← | hanya untuk submenu (fase F4, di luar v1) |

---

## 5. Keputusan (usulan — menunggu persetujuan)

| # | Keputusan | Alasan |
| --- | --- | --- |
| **N1** | Ruang lingkup v1 = **context menu** (klik kanan/long-press). Inti `wui-menu`/`wui-menu-item` dibangun supaya bisa dipakai ulang, tapi dropdown (`[wuiMenuTriggerFor]`) masuk fase terpisah | Permintaan user; menekan permukaan uji |
| **N2** | Mesin: **`@angular/cdk/menu`** (bukan tulis sendiri) | `MenuStack`, roving tabindex, type-ahead, wrap, Home/End, Esc/Tab, klik-luar, single-open se-app, dan hover-intent submenu sudah ada & teruji. Pelajaran select: yang kita tulis sendiri justru sumber hang |
| **N3** | **Revisi 23 Sep 2026 (keputusan user): `[wuiContextMenu]` membuat overlay-nya sendiri** seperti panel select — bukan `CdkContextMenuTrigger` — supaya bisa memakai **backdrop transparan** (klik & gulir belakang tertahan) dan `block()`. Mesin menu (`CdkMenu`, `CdkMenuItem`, `MenuStack`, key manager) **tetap CDK** lewat `hostDirectives` | `CdkContextMenuTrigger` tidak punya opsi `hasBackdrop` (terverifikasi `M:1842-1848`) dan overlay-nya tidak bisa disisipi backdrop setelah dibuat. Material pun begitu: `MatMenu` memiliki `hasBackdrop` sendiri. Harga yang dibayar dicatat di §3.3 (backdrop, single-open, posisi/flip, penutupan+fokus) |
| **N4** | **Tidak** meniru L10 = (b)/select untuk **navigasi menu**, tetapi **meniru pola overlay-nya** | Dua hal berbeda: model fokus (N7) dan cara menuliskan overlay. Navigasi/keyboard tetap milik CDK karena `CdkMenuItem` **tidak** membawa CVA/`SelectionModel` dan model fokusnya memang pola ARIA `menu` — sedangkan overlay, backdrop, dan siklus hidup panel kita tulis sendiri persis seperti select karena CDK tidak menyediakan knob-nya |
| **N5** | **Revisi 23 Sep 2026:** gulir & klik belakang ditahan oleh **backdrop transparan** (bukan `block()`); `block()` tetap dipasang sebagai jaring untuk aplikasi yang menggulir di dokumen. Pembekuan kontainer gulir leluhur **tidak diperlukan** | Terukur: `block()` CDK **no-op** di layout aplikasi ini (§9 baris 11) karena `_canBeEnabled()` (`overlay-module.mjs:89-101`) mensyaratkan `<html>` yang menggulir — sedangkan backdrop **terbukti** menahan roda gulir pada kontainer dalam (§9 baris 16). Jadi tidak perlu menulis logika pembekuan/pemulihan `overflow` sendiri — sesuai catatan user bahwa pertanyaan itu "tidak relevan lagi" |
| **N6** | Posisi: pakai **bawaan CDK apa adanya** (titik origin, flip + push, offset 2px), aplikasi boleh menimpa lewat `[wuiContextMenuPosition]` | Mengukur ulang flip/push sendiri = kerja yang sudah benar & teruji di CDK (`O:2115-2160`). Catatan: `.withLockedPosition()` membuat orientasi **tidak** dipilih ulang saat reposisi — itu disengaja CDK, kita ikut |
| **N7** | Model fokus: **fokus DOM pindah ke item** (roving tabindex) seperti bawaan CDK; **pemulihan fokus ke pemicu kita sendiri** | Pola ARIA `menu`; terukur di F0 baris 2 (fokus pindah) dan baris 5 (CDK **tidak** memulihkannya untuk trigger konteks) — jadi ini sekarang kewajiban `[wuiContextMenu]`, bukan harapan. Terukur juga: trap dialog/pages **tidak** merebut fokus (baris 7) |
| **N8** | Nama: `wui-menu`, `wui-menu-item`, `[wuiMenuDivider]` (di `<hr>`, pola `[wuiSidenavDivider]`), `[wuiContextMenu]` | Konsisten dengan L4 (`wui-option` sebagai komponen) dan `[wuiSidenavDivider]` sebagai directive di elemen native |
| **N9** | Gaya: seluruhnya di `scss/components/_menu.scss` (class `wui-*`), CDK tidak membawa CSS apa pun | Terverifikasi §2; `selector-class-pattern` repo juga mengizinkan `.cdk-*` kalau sesekali perlu |
| **N10** | Token `$wui-menu-*` (placeholder) + peran warna yang sudah ada; **tidak** ada `margin-*`/`padding-*` mentah, tanpa `!important` | Aturan repo |
| **N11** | Pembukaan imperatif tersedia lewat method `buka(x, y)`/`tutup()` pada `[wuiContextMenu]`; **tidak** ada service berbasis konfigurasi item | Isi menu itu template bebas (`@if`, ikon, submenu); array konfigurasi memaksa DSL kecil yang harus dirawat. Method imperatif cukup untuk kasus "buka dari kode" |
| **N12** | v1 tanpa submenu & tanpa item checkbox/radio | **Diputuskan user 23 Sep 2026**: submenu **tidak perlu**. Keduanya tetap murah ditambahkan nanti (CDK sudah mendukung) tanpa mengubah kontrak v1, jadi dicatat sebagai "kalau nanti perlu", bukan fase |

---

## 6. Yang masih terbuka

| # | Pertanyaan | Usulan agent |
| --- | --- | --- |
| **1** | ~~Strategi gulir~~ — **terjawab 23 Sep 2026**: backdrop transparan menahan klik & gulir belakang (terukur §9 baris 16–17); `block()` tetap dipasang sebagai jaring, **tanpa** pembekuan kontainer leluhur | — |
| **2** | Perlu `wui-menu` sebagai komponen, atau cukup `cdkMenu` di `<div>` dengan gaya `.cdk-menu`? | **Sudah diputuskan user 23 Sep 2026** ("saya setuju"): **tetap `wui-menu`** (N3) — kalau tidak, style layer kita bergantung pada class pihak ketiga dan tidak ada tempat API/default kita |
| **3** | ~~Angka desain~~ — **terjawab 23 Sep 2026 (permintaan user: "cari sesuai material design")**: angka diambil dari spesifikasi M3 *Menu (baseline)* dan token `md.comp.menu.*` → §3.5 | — |
| **4** | Apakah v1 perlu **submenu**? | **Sudah diputuskan user 23 Sep 2026: tidak.** CDK tetap mendukungnya kalau nanti perlu (`cdkMenuTriggerFor` di item + `CdkTargetMenuAim` untuk hover intent) |
| **5** | Perlu `WuiContextMenuService` (buka dengan array `{ label, action, disabled }`)? | **Sudah diputuskan user 23 Sep 2026: belum** — deklaratif dulu (N11). Service bisa ditambahkan di atasnya kalau ada kebutuhan nyata |
| **6** | Elemen pemicu yang tidak fokusable (mis. `<div>` baris tabel): fokus dikembalikan ke sana saat menu tertutup, tapi `focus()` pada elemen tanpa `tabindex` tidak menghasilkan apa-apa. Apakah `[wuiContextMenu]` perlu memasang `tabindex="-1"` sendiri? | Usulan: **tidak** memaksa (bisa mengubah urutan tab aplikasi); dokumentasikan + uji (§8 no. 2) |

---

## 7. Rencana fase

| Fase | Isi | DoD |
| --- | --- | --- |
| **F0** ✅ | **Spike pengukuran** — harness `src/app/pages/context-menu-spike/**` + rute `/context-menu-spike`; memakai directive CDK **apa adanya** (tanpa pembungkus) supaya yang diukur benar-benar perilaku CDK | **Selesai 23 Sep 2026** — 15 baris hasil di §9 (jendela uji 586×484). Harness dipertahankan sampai F1 selesai, lalu dihapus. Belum diukur (masuk F1/F2): `Tab`, pembungkus `hostDirectives`, `MenuTracker`, `disabled` gaya CDK (atribut native dipakai harness) |
| **F1** ✅ | Kerangka: `WuiMenu` + `WuiMenuItem` + `WuiMenuDivider` (hostDirectives CDK) + `[wuiContextMenu]` dengan overlay sendiri (backdrop transparan + `block()`, posisi titik + flip/push, `TemplatePortal`), registry satu-menu-aktif, pemulihan fokus, `stopPropagation()` pada Escape; ekspor `public-api`, `_menu.scss`, token M3 (§3.5), demo `/context-menu` | **Ditulis 23 Sep 2026** — berkas: `src/menu/{menu,menu-item,menu-divider,context-menu}.ts`, `scss/components/_menu.scss` (+ `_index.scss`, `wui.scss`), token + `themes/_light-theme.scss`, `public-api.ts`, halaman demo `/context-menu` + rute + dua tautan sidenav. **Belum dibuild & belum diuji** (aturan repo: pengetesan milik user) — lihat §11 |
| **F2** | Keyboard & a11y: verifikasi peta tombol §4 (termasuk `Tab`), `aria-*` di inspeksi, item nonaktif gaya CDK, type-ahead | Semua baris §4 terbukti + §11 bagian keyboard hijau |
| **F3** | Isi & gaya M3 penuh: slot ikon, `[wuiMenuDivider]`, (opsi) label grup & teks pintasan, token final, terang/gelap | Terukur di `wui.local` |
| **F4** ⏸️ | Submenu — **tidak dikerjakan** (keputusan user 23 Sep 2026). Dicatat sebagai kemungkinan lanjutan: `cdkMenuTriggerFor` pada item + `CdkTargetMenuAim` | Kalau nanti diminta: submenu terbuka lewat panah kanan & hover, Esc menutup satu tingkat |
| **F5** | Item pilihan: `cdkMenuItemCheckbox` + `cdkMenuItemRadio` (pembungkus + gaya centang) | — |
| **F6** | Dropdown menu (`[wuiMenuTriggerFor]` pada tombol) — inti `wui-menu` sudah siap | Dipisah ke `wui-menu-plan.md` kalau tumbuh |
| **F7** | Dokumen & demo final: `docs/panduan-komponen.md` (bagian "Menu"), `projects/wui/README.md`, daftar periksa §11, hapus rute spike | Docs memuat jebakan terverifikasi |

---

## 8. Risiko & jebakan

1. **Gulir & klik belakang — terukur, sudah diputuskan (N3/N5, §9 baris 11–12 & 16–17).** `block()`
   CDK **no-op** di layout kita, dan `reposition()` pun tidak menolong; yang benar-benar menahan roda
   gulir adalah **backdrop transparan** — itulah alasan `[wuiContextMenu]` membuat overlay sendiri.
   Sisa risiko kecil: gulir terprogram dan (kalau aplikasi menaruh scrollbar di luar area backdrop)
   drag scrollbar; keduanya di luar cakupan panel.
2. **Fokus setelah menu tertutup — terukur ❌** (baris 5): CDK meninggalkan fokus di `<body>`, jadi
   `[wuiContextMenu]` **wajib** memulihkannya (dengan syarat: hanya kalau fokus memang sedang di item
   menu, supaya klik di luar panel tidak direbut). Pemicu yang tidak fokusable tetap jadi kasus
   khusus (§6 no. 6).
3. **`Escape` bocor ke dialog — terukur ❌** (baris 6): satu Esc menutup menu **dan** dialog. Wajib
   `stopPropagation()` di elemen menu (jebakan yang sama seperti select §3.5); `preventDefault()` CDK
   saja tidak cukup.
4. **Trap page/dialog vs fokus menu — terukur ✅ tidak terjadi** (baris 7): menu di dalam dialog
   tetap terbuka dan fokusnya tidak direbut. Tetap dicatat sebagai risiko kalau F1 menambah
   `focus()` sendiri (mis. pemulihan fokus yang salah waktu).
5. **Item `disabled` tetap dilewati panah** — bawaan CDK (`skipPredicate(() => false)`,
   `M:1337`); `keyManager` **protected** dan `_setKeyManager()` **private**, jadi tidak ada jalur
   publik untuk mengubahnya. Diterima: item nonaktif boleh difokus (ARIA membolehkan), tidak boleh
   diaktifkan. Kalau user ingin dilewati, itu berarti mengganti mesinnya — catat sebagai keputusan
   sadar.
6. **Klik kanan pada elemen yang menangani klik kanan sendiri** (mis. editor/map) — kalau aplikasi
   juga `preventDefault()`, urutannya menentukan; `[wuiContextMenuDisabled]` mematikan menu kita
   (dan CDK **membiarkan** menu bawaan browser muncul, `M:1816`).
7. **Long-press di sentuh** — CDK **tidak** punya listener sentuh sendiri: hanya mengandalkan event
   `contextmenu` bawaan (long-press Safari/Chrome Android memicunya dengan `button === 0` ⇒ fokus
   ber-origin `'keyboard'`). Quirk Safari (`-webkit-touch-callout`) perlu diuji manual, bukan diasumsikan.
8. **`stopPropagation()` pada klik kanan** — CDK menghentikan propagasi; menu bersarang tidak ikut
   terbuka, tetapi aplikasi yang mengandalkan `contextmenu` di leluhur juga tidak akan menerimanya.
9. **Satu menu aktif se-app** (`MenuTracker`) — perilaku yang diinginkan, tapi bisa mengejutkan:
   membuka menu B menutup menu A meski dua-duanya di komponen berbeda.
10. **Penamaan binding CDK** — `cdkMenuitemTypeaheadLabel` (huruf `i` kecil) dan pemetaan
   `hostDirectives` yang menuntut **nama publik**; salah tulis = `HOST_DIRECTIVE_UNDEFINED_BINDING`
   saat build (bukan runtime). Satu hal yang **harus diverifikasi di F1**: transform
   `booleanAttribute` milik CDK pada `cdkMenuItemDisabled`/`cdkContextMenuDisabled` (`M:1123`)
   apakah tetap berlaku saat input-nya diekspos lewat `hostDirectives`. Kalau tidak terbawa: atribut
   kosong `disabled` justru **tidak** menonaktifkan apa pun, sedangkan `[disabled]="false"` malah
   menonaktifkan item (string `"false"` truthy). Mitigasi kalau bermasalah: deklarasikan input kita
   sendiri dengan `booleanAttribute` dan tulis properti CDK-nya lewat setter/`effect` kecil.
11. **`hostDirectives` + perubahan Angular** — query melihat host directive terverifikasi di 20.3
   (`debug_node.mjs:16973-16974`), tapi ini perilaku **implementasi** (tidak tertulis di dokumentasi
    paket). F0 **belum** menguji pembungkusnya (harness sengaja memakai directive CDK apa adanya) →
    F1 yang membuktikan sistem pembungkusnya jalan, bukan hanya membaca sumber.11b. **DUA asumsi F1 yang wajib diverifikasi sebelum F1 dianggap selesai** (keduanya sudah ditulis di
    kode, keduanya belum pernah dijalankan):
    (1) **`CdkMenu` sebagai host directive pada komponen `wui-menu`** — apakah
    `ContentChildren(CdkMenuItem, { descendants: true })` miliknya benar-benar melihat item yang
    **diproyeksikan** aplikasi lewat `<ng-content>`? Cadangan kalau tidak: jadikan `[wuiMenu]` sebuah
    *directive* pada `<div>` (tanpa template & proyeksi) — struktur yang sudah terbukti bekerja di
    F0. (2) **Transform `booleanAttribute`** pada `cdkMenuItemDisabled`/`cdkContextMenuDisabled`
    saat input-nya diekspos lewat `hostDirectives` (§8 no. 10). Keduanya terlihat dari halaman
    `/context-menu` setelah `npm run build:wui` + `ng build`.12. **Panel terpotong / di bawah elemen lain** — selalu render via overlay (pola dialog); `z-index`
    **tidak** perlu token baru: pane menu dibuat setelah dialog hidup di `.cdk-overlay-container`
    yang sama (terukur di spike select §9 baris 3–4, dan terukur lagi untuk menu di §9 baris 7).
13. **Item berisi elemen interaktif** (tautan/tombol di dalam `role="menuitem"`) — ARIA-nya salah dan
    kliknya berebut dengan `CdkMenuItem`. Dokumentasikan: satu item = satu aksi.
14. **Zoneless & SSR** — seluruh perilaku dari CDK + signal; overlay dibuat saat interaksi.
15. **Dist & tipe** — playground membaca tipe `@wajek/wui` dari `dist`: `npm run build:wui` wajib
    sebelum `ng build`, dan sampai itu editor akan melaporkan `'wui-menu-item' is not a known element`.
16. **Jebakan lint yang sudah kena di komponen lain** — `declaration-empty-line-before`,
    `scss/dollar-variable-pattern: ^wui-`, `selector-class-pattern`, `max-nesting-depth: 3`,
    komentar `//` kosong ditolak.
17. **Angka desain belum ada** — semua di token placeholder `$wui-menu-*` (§3.5), jangan disebar di
    komponen.

---

## 9. Hasil spike F0 ✅ (diukur 23 Sep 2026 di `wui.local/context-menu-spike`)

Harness: `src/app/pages/context-menu-spike/**` + rute `/context-menu-spike` (kode sekali pakai),
memakai directive CDK **apa adanya** (`[cdkContextMenuTriggerFor]` + `cdkMenu` + `cdkMenuItem`) —
tanpa pembungkus — supaya yang diukur benar-benar perilaku CDK. Jendela uji **586×484** (sempit &
pendek, jadi kasus tepi ikut terbaca). Semua angka dari `getBoundingClientRect`, `getComputedStyle`,
`document.activeElement`, dan **masukan asli** (klik kanan mouse, roda gulir, tombol keyboard) —
bukan `.click()` JS.

| # | Yang diukur | Hasil |
| --- | --- | --- |
| 1 | Menu dibuka di titik penunjuk? | ✅ Klik kanan (348,274) → panel (349,276) = **offset bawaan +1,+2** (`CONTEXT_MENU_POSITIONS`) |
| 2 | Fokus saat menu dibuka | ✅ CDK memindahkan **fokus DOM ke item pertama** (log `BUKA` masih `body`, satu frame kemudian item) — N7 terkonfirmasi |
| 3 | Panah / Home / End / type-ahead | ✅ panah atas-bawah + **wrap** (dari item terakhir kembali ke pertama), Home/End, dan type-ahead (`cdkMenuitemTypeaheadLabel="Zebra"` dihormati). Panah **tidak melewati** item nonaktif: penunjuknya mendarat di sana (2× panah dari item 1 baru sampai item 3) |
| 4 | Enter / klik item | ✅ `(cdkMenuItemTriggered)` **sekali** (tidak dobel walau itemnya `<button>`), menu tertutup |
| 5 | Fokus setelah menu tertutup | ❌ **tidak kembali ke elemen pemicu** — jatuh ke `<body>` (Esc, klik item, maupun `open()` programatik). Beda dari `CdkMenuTrigger` (dropdown) yang mengembalikannya; trigger konteks hanya menutup (`_setMenuStackCloseListener`, `M:1860-1869`) |
| 6 | Escape di dalam dialog | ❌ **menutup menu DAN dialognya sekaligus** — CDK `preventDefault()` tanpa `stopPropagation()`, sedangkan listener Esc dialog ada di tingkat dokumen (jebakan yang sama seperti select §3.5) |
| 7 | Menu di dalam dialog | ✅ tetap terbuka, fokus **tidak** direbut trap dialog (`activeElement` = item menu), dan pane menu dibuat **terakhir** di `.cdk-overlay-container` → tampak di atas dialog lewat urutan DOM (`z-index` sama-sama 1000) |
| 8 | Push di tepi jendela | ✅ `open()` di (580,478) → panel 200×176 di (378,300) = **utuh** di dalam jendela (kanan 578 ≤ 586, bawah 476 ≤ 484) |
| 9 | RTL | ✅ panel diposisikan ke **kiri** titik (titik (458,274) → panel (256,275)) = arah `end` ikut terbalik. ⚠️ `dir` **tidak** dipasang CDK di elemen panel (`paneDir: null`) → arah teks/padding di dalam panel urusan kita (logical property) |
| 10 | Daftar panjang (40 item, `max-height: 240px`) | ✅ roda gulir di atas panel menggulir **panelnya** (scrollTop 8 → 308; clientHeight 240, scrollHeight 1616), halaman **tidak** ikut bergeser |
| 11 | `block()` (keputusan N5) | ❌ **no-op di layout aplikasi ini.** Tidak ada kelas `cdk-global-scrollblock` di `<html>`, dan `.wui-page-content` **tetap menggulir** (832 → 1232) selagi menu terbuka. Sebabnya di CDK: `BlockScrollStrategy._canBeEnabled()` (`overlay-module.mjs:89-101`) mensyaratkan **`<html>` sendiri yang menggulir** (`documentElement.scrollHeight > viewport.height`), sedangkan di aplikasi kita yang menggulir adalah `.wui-page-content` di dalam lapisan page. Jadi ini bukan soal provider salah tempat |
| 12 | `reposition()` (bawaan CDK) | ⚠️ juga tidak menolong: sasaran `Scrolled` adalah leluhur overlay (dokumen), sedangkan yang menggulir ada di dalam halaman → panel **diam** di posisi viewport sementara isinya bergerak di belakangnya |
| 13 | PageUp / PageDown saat menu terbuka | ✅ aman: halaman tidak bergeser (fokus ada di item menu, tidak ada leluhur yang bisa digulir) — **tidak** perlu penahan seperti select F2c |
| 14 | Klik di belakang panel | ✅ tembus: tombol di belakang menerima klik (+1) **dan** menu tertutup (panel tanpa backdrop) |
| 15 | Item dinamis (`@for`) selagi menu terbuka | ✅ daftar tersegarkan (3 → 5 item), menu tetap terbuka, panah mengenali item baru (`Dua` → `Tiga` → `Baru 4`) |
| 16 | **Backdrop menahan gulir pointer** (keputusan N5 revisi) | ✅ Diuji pada dialog yang sedang terbuka: roda gulir di titik di atas `div.cdk-overlay-backdrop` → `.wui-page-content.scrollTop` **tidak bergerak** (1757 → 1757), sedangkan `elementFromPoint` di titik itu memang backdrop. Bandingkan dengan menu tanpa backdrop: bergerak 832 → 1232 (baris 11) |
| 17 | Batas cakupan backdrop | ⚠️ Gulir **terprogram** tetap bisa (`el.scrollTop += 300` → 2057) — di luar urusan panel. Gulir keyboard juga sudah aman karena fokus ada di item menu (baris 13) |
| 18 | **Tumpukan lapisan** (pertanyaan user 23 Sep 2026) | ✅ `.cdk-overlay-container` = **z 1100** (`--wui-z-dialog`), di dalamnya wrapper & pane = **z 1000**, sedangkan `.wui-page-layer` = **z auto** → **pane overlay adalah lapisan terdepan**; antar pane, urutan DOM menentukan (menu dibuat setelah dialog → di atasnya, baris 7) |

**Temuan yang mengubah rencana:**

1. **N5 selesai dengan N3 (keputusan user 23 Sep 2026).** "Block seperti Material" **belum bisa**
   diandalkan sendiri (`block()` no-op di layout kita, baris 11), tetapi **backdrop transparan**
   — yang datang bersama keputusan membuat overlay sendiri (N3) — ternyata **menahan roda gulir**
   (baris 16). Jadi gulir & klik belakang tertutup tanpa menulis logika pembekuan `overflow`.
2. **Fokus harus dikembalikan sendiri** oleh `[wuiContextMenu]` (CDK tidak melakukannya untuk menu
   konteks). Menambah satu kewajiban di F1 → §4.
3. **Escape wajib `stopPropagation()`** di `WuiMenu` — **diputuskan user: `Esc` menutup satu tingkat
   saja**, seperti panel select.
4. **PageUp/PageDown tidak perlu ditahan** (beda dari select): celah itu tertutup sendiri karena
   fokus ada di dalam panel, bukan di host yang hidup di tengah halaman.

**Belum diukur di F0** (masuk F1/F2, bukan diasumsikan): `Tab` (belum dicoba); pembungkus
`hostDirectives` (F1 — perilaku query-nya baru terbukti dari sumber Angular, §2); `MenuTracker` dua
pemicu → satu menu (baru terbukti dari kode); atribut `disabled` gaya CDK (`cdkMenuItemDisabled`) —
harness memakai atribut native `<button disabled>`, yang justru membuktikan hal lain: tombol
nonaktif **tidak bisa menerima fokus DOM**, sehingga di library nanti item nonaktif harus memakai
`aria-disabled` + properti CDK (bukan `disabled` native).

---

## 10. Alternatif yang ditolak

| Alternatif | Alasan ditolak |
| --- | --- |
| Menulis mesin menu sendiri (overlay + key manager + `MenuStack` sendiri), meniru L10 = (b) di select | Harus menulis ulang: stack bertingkat, roving tabindex, type-ahead, wrap, Home/End, Esc/Tab, klik-luar, satu-menu-aktif se-app, dan hover-intent submenu — persis jenis permukaan bug yang membuat F2 select harus dikembalikan |
| Memakai `[cdkContextMenuTriggerFor]`/`cdkMenu` apa adanya di markup aplikasi | Tidak ada `hasBackdrop` (N3/N5) sehingga klik & gulir belakang tembus, tidak ada tempat menaruh default kita, dan `cdk*` bocor ke dokumen aplikasi |
| `block()` saja, tanpa backdrop | Terukur no-op di layout aplikasi ini (§9 baris 11): menu terbuka, halaman tetap menggulir di belakangnya |
| Menahan klik belakang dengan listener di tingkat dokumen (tanpa backdrop) | Cuma menutup/menelan klik; gulir roda tetap menembus (bukti: baris 16 vs 11), dan menyalin backdrop secara tidak sempurna — ditolak setelah user memilih overlay sendiri |
| `@angular/material` `MatMenu` | K7: dua sistem tema, bahasa visual Material bocor |
| Pustaka pihak ketiga (PrimeNG, ng-zorro, …) | Dependency baru + bahasa visual sendiri |
| Service konfigurasi (`open(x, y, items[])`) sebagai API utama | Isi menu itu template bebas (`@if`, ikon, submenu, item dari loop); DSL array harus dirawat dan selalu kalah fitur. Method imperatif (N11) menutup kebutuhan "buka dari kode" |
| Menyalin gaya `.cdk-menu` dari CDK | CDK **tidak** mengirim CSS menu sama sekali (§2) |
| `block()` + backdrop transparan seperti panel select | CDK tidak menyediakan `hasBackdrop` untuk menu (`M:1842-1848`), dan backdrop tidak menambah apa pun: klik luar **sudah** menutup menu (terukur baris 14) — yang kurang hanya pembekuan gulir, dan itu tidak datang dari backdrop |
| `block()` saja, tanpa membekukan kontainer gulir leluhur | Terukur no-op di layout aplikasi ini (§9 baris 11): menu terbuka, halaman tetap menggulir di belakangnya |
| Membekukan `overflow` kontainer gulir leluhur pemicu | **Tidak diperlukan** begitu backdrop dipakai: roda gulir sudah ditahan backdrop (§9 baris 16), dan pembekuan `overflow` menambah kerja pemulihan yang rawan (menu bisa ditutup lewat banyak jalur) |
| Menyaring item `disabled` dari navigasi lewat API internal CDK | `keyManager` protected & `_setKeyManager()` private (§8 no. 5) |

---

## 11. Daftar periksa (manual, dijalankan user)

Saat fase dieksekusi — **agent tidak menjalankannya sendiri**:

- `npm run lint:styles` hijau; `npm run build:wui` lalu `ng build`.
- **Verifikasi F1 yang baru ditulis** (dua asumsi §8 no. 11b): buka `/context-menu` — menu terbuka
  dari klik kanan, item bisa diaktifkan `Enter`, dan panah berpindah item (kalau panah diam atau
  tidak ada item yang difokus ⇒ asumsi (1) gagal: item tidak terbaca `CdkMenu`); item `disabled`
  benar-benar nonaktif (kalau tidak ⇒ asumsi (2) gagal: transform `booleanAttribute`).
- Klik kanan pada pemicu → menu muncul **di titik penunjuk** (offset ±2px), menu bawaan browser **tidak** muncul.
- Klik kanan pada dua pemicu berbeda → hanya satu menu terbuka (yang lama tertutup).
- Keyboard: setelah menu terbuka, `↓`/`↑` berpindah item (wrap di ujung), `Home`/`End` ke ujung,
  mengetik huruf melompat sesuai `typeaheadLabel`, `Enter` menjalankan aksi, `Esc` menutup **tanpa**
  aksi, `Tab` menutup dan fokus lanjut ke elemen berikutnya.
- **Fokus kembali ke elemen pemicu** setelah menu tertutup (Esc, Enter, item diklik) — bukan ke
  `<body>` (temuan F0 baris 5).
- **`Esc` menutup satu tingkat**: menu dalam dialog menutup menu saja, dialognya tetap terbuka
  (temuan F0 baris 6 + keputusan user).
- **Klik di elemen belakang tidak bereaksi**, dan **roda gulir di atas backdrop tidak menggeser
  halaman** (`.wui-page-content`) — inti N3/N5 revisi (temuan F0 baris 16).
- **Halaman tidak menggulir** selagi menu terbuka, termasuk saat yang menggulir adalah
  `.wui-page-content` (bukan `<html>`) — inti keputusan §6 no. 1.
- Menu dengan daftar panjang: isi panel **bisa** menggulir sendiri sementara halaman tetap terkunci.
- Inspeksi ARIA: `wui-menu` = `role="menu"` + `aria-orientation="vertical"`; tiap item =
  `role="menuitem"`; hanya **satu** item ber-`tabindex="0"` (yang sedang difokus); item nonaktif =
  `aria-disabled="true"` dan **tidak** bisa di-Enter/klik.
- Pemicu yang tidak fokusable (`<div>` baris tabel): catat ke mana fokus jatuh setelah menu tertutup —
  jadi catatan dokumentasi, bukan bug (§6 no. 6).
- RTL: panel muncul di sisi `end` yang benar (terukur: ke **kiri** titik), dan teks/padding di dalam
  panel ikut RTL (CDK **tidak** memasang `dir` di panel — kita yang mengurusnya).
- Buka di dekat tepi kanan & bawah jendela → menu **flip/push** dan tetap utuh di dalam jendela.
- Menu di dalam `<wui-page>` dan di dalam dialog: muncul di atas, bisa di-klik, dan `Esc` menutup
  **menu saja** (bukan dialognya).
- Item ditambah/dihapus (`@for`) saat menu terbuka → daftar tetap konsisten.
- Sentuh: long-press membuka menu (uji di perangkat/emulator, bukan asumsi).
- Terang & gelap; RTL bila halaman ujinya ada; bandingkan dengan opsi select supaya bahasa visualnya satu.
- `[wuiContextMenuDisabled]="true"` → menu kita tidak muncul, menu bawaan browser kembali.
- Dokumentasi: `docs/panduan-komponen.md` + `projects/wui/README.md` memuat contoh dan jebakan §8.

---

## 12. Referensi

- WAI-ARIA Authoring Practices — pola **menu & menubar** (`role="menu"`, `menuitem`, roving tabindex,
  peta tombol, aturan item nonaktif).
- Material 3 — *Menus* (struktur panel, tinggi item, elevasi, label grup) untuk angka yang menyusul.
- CDK: `node_modules/@angular/cdk/menu/index.d.ts` (permukaan API + nama binding publik) dan
  `node_modules/@angular/cdk/fesm2022/menu.mjs` (host binding, key manager, config overlay trigger).
- `node_modules/@angular/cdk/fesm2022/overlay-module.mjs` — `CloseScrollStrategy`/`RepositionScrollStrategy`,
  `FlexibleConnectedPositionStrategy` (flip/push), `STANDARD_DROPDOWN_BELOW_POSITIONS`.
- `node_modules/@angular/core/fesm2022/debug_node.mjs` — bukti query melihat `hostDirectives`.
- `docs/planning/wui-select-plan.md` §3.4–§3.5, §9 — pola overlay, jebakan pane flex, dan pelajaran hang.
