# Panduan komponen

Ringkasan perilaku & jebakan terverifikasi per komponen. Detail keputusan ada di plan masing-masing
(`docs/planning/*.md`).

## Prinsip umum

- Class publik selalu `wui-*` (BEM ringan): `.wui-button`, `.wui-button--outlined`, `.wui-dialog__title`.
- State memakai `.is-*` (`.is-active`, `.is-dense`, `.is-hover`).
- Komponen yang bisa dipakai sebagai atribut memakai directive dengan selektor atribut
  (`[wuiButton]`, `[wuiInput]`, `[wuiSidenavBody]`), bukan komponen pembungkus.
- A11y adalah tanggung jawab library: wiring `for`/`id`, `aria-describedby`, `aria-invalid`, focus trap.

## Button (`src/button/`)

- `WuiButton` (`[wuiButton]`) + input `variant` (`filled|outlined|text`), `size` (`sm|md|lg|xl`),
  `color` (`default|primary|danger`), `iconPos` (`start|end`), `iconOnly`.
- Default tombol = **netral** (`default`), bukan primary.
- Indirection 4 variabel: `--wui-button-container` (latar filled), `--wui-button-content` (label di
  atas container), `--wui-button-accent` (label outlined/text **dan** warna state layer),
  `--wui-button-outline` (border outlined). Varian `--color-*` menimpa keempatnya.
- Ikon dipilih lewat selektor `.wui-button > wui-icon` → ikon **wajib anak langsung** tombol; `order`
  yang menggeser posisinya (teks label tidak perlu dibungkus).
- Padding sengaja **simetris** (aturan `:has(> wui-icon)` dihapus); jarak ikon-label dari `gap`.
- `iconOnly` = atribut tanpa nilai (`booleanAttribute`) karena CSS tidak bisa menguji keberadaan teks.
- `<a wuiButton>` didukung: `text-decoration: none` + `[aria-disabled='true']` menyertai `:disabled`.
  Konsumen perlu menambahkan `tabindex="-1"` bila tautannya harus keluar dari urutan tab.
- ⚠️ Saat mengukur: `background-color` bertransisi 0.24s; di halaman yang tidak visible transisinya
  tidak maju sehingga `getComputedStyle` melaporkan nilai lama.
- ⚠️ Elemen tombol selalu membawa `.wui-button` (latar filled) → varian `outlined`/`text` **wajib**
  menulis `background-color: transparent`.

## Dialog (`src/dialog/`, `WuiDialogService`)

- Istilah: widget = **dialog**; "modal" hanya sifatnya. Nama API `WuiDialog*`, urutan generic mengikuti
  CDK: `WuiDialogRef<R, C>`. Pakai `@angular/cdk` (`overlay`, `dialog`), `Dialog` `providedIn: 'root'`.
- `WuiDialogService.alert({ title, content, buttons, dismissible })` → index tombol atau `null`.
  Selalu `role="alertdialog"`; `content` disanitasi Angular (terima `SafeHtml`), `white-space: pre-line`.
- ⚠️ CDK menggabungkan config dengan `{...defaults, ...config}` **tanpa menyaring `undefined`** →
  service memakai helper `onlyDefined()` supaya opsi kosong tidak mematikan default CDK.
- ⚠️ Dua aturan kemenangan CSS yang wajib diingat:
  1. `z-index` CDK dibungkus `@layer cdk-overlay` → rule di luar layer selalu menang, penimpaan cukup biasa.
  2. Properti lain (mis. `max-width` di `.cdk-overlay-pane`) ada di luar layer dan stylesheet CDK datang
     **setelah** stylesheet kita → wajib naik specificity: `.cdk-overlay-pane.wui-dialog`.
- CDK menyuntikkan structural CSS-nya sendiri saat runtime (`cdk-overlay-style-loader`) — tidak perlu
  `overlay-prebuilt.css` maupun salinan `.cdk-overlay-*`.
- ⚠️ Sass di `@angular/build` tidak me-resolve `node_modules`: `@use '@angular/cdk/overlay'` **gagal**
  di build aplikasi. Jangan mengandalkan impor Sass dari CDK.
- Class struktur `.wui-dialog__title` (`title/medium`) / `__content` (`body/medium`) / `__actions`
  boleh dipakai dialog buatan aplikasi.

## Form field (`src/form-field/`)

- `<wui-form-field>` mengurus **wiring a11y**, bukan nilai: `for` label ↔ id kontrol (id otomatis
  `wui-form-field-N`; id milik aplikasi menang), `aria-describedby` digabung dengan milik aplikasi,
  `aria-invalid="true"` begitu `[error]` terisi. Pesan error **menggantikan** hint.
- `WuiLabel` (`label[wuiLabel]`) mengisi `for` dari `field.controlId()`; input `label` dihapus —
  label ditulis aplikasi sebagai elemen yang diproyeksi.
- `WuiInput` (`input[wuiInput], textarea[wuiInput]`) memasang `placeholder=" "` bila aplikasi tidak
  menulisnya (tanpa itu `:placeholder-shown` tidak pernah cocok sehingga label tidak mengapung).
  Tidak butuh CVA — elemen native + `DefaultValueAccessor` sudah bekerja dengan `formControlName`.
- Keadaan mengapung dihitung CSS: `.wui-form-field:has(.wui-input:focus)` dan
  `:has(.wui-input:not(:placeholder-shown))`, dan hanya mengubah custom property
  (`--wui-field-label-top`, `-scale`) yang dibaca `.wui-form-field__label`.
- ⚠️ Host komponen **wajib** punya class dasar (`host: { class: 'wui-form-field' }`); tanpa itu seluruh
  style container (termasuk `position: relative`) tidak berlaku.
- ⚠️ `:disabled` menulis `background-color` di `.wui-input` tapi kalah oleh varian `filled` yang
  ditulis belakangan (utang yang diketahui).
- ⚠️ Saat mengukur state fokus: panggil `page.bringToFront()` dulu — di halaman yang tidak aktif
  `:focus` tidak cocok walau `document.activeElement` sudah `INPUT`. Pisahkan fokus & pembacaan ke dua
  `evaluate` + jeda.

## Sidenav (`src/sidenav/`)

- Struktur dua area untuk mini **dan** full: `.wui-sidenav-body` (`[wuiSidenavBody]`, satu-satunya bagian
  yang menggulir) dan `.wui-sidenav-footer` (`[wuiSidenavFooter]`, menempel di bawah + `border-top`).
- ⚠️ Butuh `min-height: 0` di area scroll **dan** `flex: 0 0 auto` di `.wui-sidenav-item`; tanpa keduanya
  daftar panjang hanya "gepeng" dan tidak pernah menggulir.
- ⚠️ Panel `.wui-sidenav-inner` wajib `width: 100%` (bukan `var(--wui-sidenav-width)`).
- ⚠️ Mode mini: scrollbar klasik 15px menggeser ikon 7.5px → `scrollbar-width: none` +
  `::-webkit-scrollbar { width: 0 }` khusus bagian body mode mini.
- **Breaking API**: `WuiSidenavInner` (`[wuiSidenavInner]`) dihapus; digantikan `WuiSidenavBody`/`Footer`.
- State dikunci oleh `id` sidenav lewat `WuiSidenavService` (`toggle`, `toggleMini`, `state(id)`).

## Page stack (`WuiPageService`)

- Layer halaman ditumpuk di overlay milik `<wui-app>`; a11y memakai `FocusTrapFactory` **dasar**
  (bukan `ConfigurableFocusTrap`) — aturan "hanya trap teratas aktif" dikelola sendiri
  (`entry.trap.enabled = posisi === teratas`).
- ⚠️ `ViewContainerRef.element` adalah `ElementRef` (elemennya di `.nativeElement`), dan layer page
  adalah **saudara** `.wui-app__overlay-host` → saat menyembunyikan shell dengan `aria-hidden`, langkah
  walk wajib melewati elemen milik stack (`.wui-page-layer`, `.cdk-focus-trap-anchor`).
- ⚠️ Konsekuensi struktur: page varian `full` **tidak** menutupi topbar/sidenav aplikasi — hanya area
  konten (belum diputuskan).
- `WuiPageOptions.variant` (`'full' | 'modal'`) masih belum dikonsumsi di kode mana pun → perilaku ESC
  khusus modal belum ada.

## Table & pagination

- `WuiTable` (`table[wuiTable]`, `WuiTableResponsive`) dan `WuiPagination` diadaptasi dari wui-angular 17.
- Class publik wajib prefix: `.wui-table-col--action`, `.wui-table-col--sticky-left|right`,
  `.wui-table-row--no-border`, `.wui-pagination--inside-container`. Alias lama yang masih ada:
  `wui-table-alternate`, `wui-table-hover`.
- Media query tabel memakai notasi **range** (`@media screen and (width <= 768px)`) dan isinya cukup
  mengubah `--wui-table-edge-padding`.

## Topbar, icon, badge, loading

- Topbar: baris flex dengan tiga slot `.wui-topbar-leading` / `-content` / `-trailing`; padding inline
  dari `--wui-topbar-padding-inline`.
- `<wui-icon>` tidak membawa data ikonnya; daftarkan lewat `provideIcons({ name, path })` (`@mdi/js`)
  lalu pakai `icon="name"`. Warnanya `inherit` dari induk — jangan diubah.
- `_badge.scss` dan `_loading.scss` masih WIP user (sisa error lint dibiarkan; jangan dirapikan tanpa diminta).
