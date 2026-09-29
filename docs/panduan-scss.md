# Panduan SCSS (`projects/wui/scss`)

Konvensi & jebakan style layer. Plan per fitur ada di `docs/planning/scss-*.md`.

## 1. Struktur & urutan

| Level | Folder | Isi |
| --- | --- | --- |
| 1 | `abstracts/` | token, fungsi, mixin — **tidak menghasilkan CSS** |
| 2 | `base/` | reset, tipografi, heading, layout dasar |
| 3 | `themes/` | emisi `--wui-*` ke `:root` (peran, palet, token mode-agnostik) |
| 4 | `components/` | style per komponen |
| 5 | `layout/` | container, grid |
| 6 | `utilities/` | spacing, gap, flex — **paling akhir** |

- Urutan ini mekanisme kemenangan: komponen boleh menimpa base, layout boleh menimpa komponen, dan
  utilitas boleh menimpa semuanya **tanpa `!important`** (lint melarang `!important`).
- `scss/wui.scss` hanya memanggil mixin: satu baris `@include` per fitur. **Mematikan fitur = hapus
  barisnya.**
- Konsumen memakainya manual: `@use '@wajek/wui/scss/wui.scss';` (tidak ada auto-inject).

## 2. Aturan berkas & barrel

- Satu berkas = satu fitur, berisi **mixin bernama sama** dengan berkasnya (`_button.scss` → `@mixin button`).
- Berkas tanpa prefix `_` = public API; prefix `_` = internal partial.
- `_index.scss` tiap level `@forward` berkas-berkasnya.
- ⚠️ **`@forward` modul yang punya variabel `!default` harus berada SEBELUM modul lain yang `@use`
  modul itu.** Kalau terbalik, build gagal keras:
  `Error: This module was already loaded, so it can't be configured using "with".`
  Contoh nyata: `abstracts/_index.scss` menaruh `@forward 'tokens';` paling awal; `wui.scss` menaruh
  `@forward 'abstracts'; @forward 'themes';` sebelum `@use` apa pun.

## 3. Token & emisi

- **Satu-satunya tempat menulis nilai desain**: `abstracts/_tokens.scss` (tidak menghasilkan CSS).
- `themes/_light-theme.scss` meng-emit token mode-agnostik (`--wui-space-*`, radius, z-index, motion,
  field, dialog, sidenav, topbar, skala tipografi) ke `:root`; `themes/_schemes.scss` meng-emit warna
  peran untuk dua mode; `themes/_dark-theme.scss` hanya `color-scheme`.
- Karena semuanya CSS variable, aplikasi bisa menimpanya **saat runtime** tanpa rebuild (kecuali yang
  dipakai di media query, mis. breakpoint).
- **Skala `rem` dipatok 16px** secara eksplisit di `base/_typography.scss`
  (`:root { font-size: 16px }`). Token spacing & skala tipografi ditulis dengan asumsi root 16px,
  jadi `1rem` tidak boleh ikut setelan ukuran font bawaan browser. Ukuran teks bawaan (body/medium)
  tetap di `body`, **bukan** `:root` — lihat komentar di berkasnya.
- ⚠️ Jangan pakai `null` sebagai "matikan" pada variabel konfigurasi `!default` — `null` dianggap
  "belum diisi" sehingga jatuh ke default. Sentinel yang dipakai repo ini: **`false`**.

## 4. Spacing

- `$wui-spacers`: `0 · 0.25rem · 0.5rem · 1rem · 1.5rem · 3rem` (metrik Bootstrap), berbasis `$wui-spacer: 1rem`.
- Fungsi `spacing($step)` (nilai mentah) dan `spacing-var($step)` → `var(--wui-space-N, <fallback>)`.
- Mixin `a.space($dir, $step)` menulis deklarasi; peta arah (`m/mt/mb/ms/me/mx/my`, `p/pt/pb/ps/pe/px/py`)
  tinggal di `$wui-margin-dirs` / `$wui-padding-dirs` — **sumber tunggal** untuk mixin & utilitas.
  Sumbu x/y dan sisi s/e memakai logical property, jadi RTL benar tanpa aturan tambahan.
- Utilitas `.wui-{m|p}{t,b,s,e,x,y,}-{0..5}` + varian `-auto`, plus varian responsif `-<bp>-`.
- **Aturan**: jangan menulis `margin-*`/`padding-*` manual di komponen — pakai mixin supaya metrik satu.

## 5. Warna

- **Sumber nilai = skema Material Theme Builder** (M9, 22 Sep 2026): `$wui-schemes` bawaan berisi 45
  peran M3 (hex, mode terang + gelap) dari export `default.json`. Aplikasi memakai generator
  `npx wui-theme` → `src/theme/_wui-schemes.scss`, lalu `styles.scss` cukup 2 baris
  (`@use './theme/wui-schemes' as theme;` + `with ($wui-schemes: theme.$wui-schemes)`).
  Plan: `docs/planning/wui-color-mtb-plan.md` (§2 = kontrak `styles.scss`-nya).
- Definisi tiap peran (arti, pasangan wajib, larangan) → `docs/panduan-warna.md`; nilainya di
  `themes/_schemes.scss`.
- **Skema = peta peran per mode**: `themes/_schemes.scss` (`$wui-schemes`, `scheme-value()`,
  `schemes-for-mode()`, `scheme-validated()`, `schemes()`, `derived-roles()`). Nilai peran boleh
  `(palet, tone)`, warna langsung, string CSS apa pun, atau `false` (tidak di-emit).
  Divalidasi saat build: `$wui-role-required` (peran yang dibaca komponen — 18 peran, daftarnya di
  `abstracts/_tokens.scss`) wajib ada, dan setiap `X`/`X-container` wajib punya `on-*`-nya — kalau
  tidak, `@error` menyebut peran yang hilang. Peta aplikasi **menggantikan** peta bawaan, tidak
  digabung, jadi pakai generator `npx wui-theme` bila tidak mau menulisnya lengkap.
- **Palet = data pasif**: `$wui-palettes-builtin` = 5 palet bentuk MTB (`primary`, `secondary`,
  `tertiary`, `neutral`, `neutral-variant`) dengan tone **absolut** `0…100`, satu skala untuk kedua
  mode. Tidak di-emit secara default (`$wui-palette: false`); gunanya data rujukan + bentuk
  `(palet, tone)` (mis. `a.color-raw('brand', 40)`). `themes/_palette.scss` tinggal emit skala +
  validasi peta tone.
- Palet milik aplikasi masuk lewat `$wui-palettes-extra` (digabung jadi `$wui-palettes`), bentuk peta
  `(tone: warna)` dengan tone numerik (konvensi MTB `0…100`) — `@error` bila bukan angka atau bukan
  warna. Nama palet dilarang bentrok dengan nama peran (`$wui-palette-reserved`), jadi palet bawaan
  bernama MTB itu hanya berlaku sebagai data.
- State layer (`--wui-color-state-layer-<role>-opacity-08/10/16`) diturunkan di CSS dengan
  `color-mix(in srgb, var(--wui-color-<role>) N%, transparent)` — satu definisi untuk kedua mode.
  Peran yang tidak ada di skema **dilewati**; yang wajib sudah dijaga `$wui-role-required`.
  ⚠️ Kunci peta opacity harus **string** (`"08"`); angka `08` menjadi `8` sehingga token jadi `opacity-8`.
- `--wui-color-primary` dan peran lain kini **hex compile-time**, jadi tidak ikut berubah kalau token
  skala palet ditimpa saat runtime (runtime palette switching ditunda — C10 di plan warna).

## 6. Heading (`base/_heading.scss`)

- **Tipografi berlaku di mana pun** (termasuk di dalam `<article>`): `$wui-heading-typography`
  memetakan `h1` display/large · `h2` display/medium · `h3` display/small · `h4` headline/large ·
  `h5` headline/medium · `h6` headline/small, divalidasi `heading-type()` terhadap `$wui-typography-scales`.
- **Margin hanya di dalam `<article>`**: `h1–h6 { margin-block: 0 }` di tempat lain, dan
  `article hN { margin-block: var(--wui-heading-margin-N, …) }` dengan nilai `$wui-heading-margins`
  (40/16 · 32/16 · 28/12 · 24/12 · 20/8 · 16/8 px).
- Alasan token sendiri: skala `$wui-spacers` melompat `1rem → 1.5rem → 3rem`; 8/16/24px memakai
  `$wui-space-2/3/4`, sisanya kelipatan `$wui-spacer` (`* 0.75/1.25/1.75/2/2.5`).
- Class selalu menang atas selektor elemen, jadi komponen tetap bisa punya judul sendiri
  (mis. `.wui-dialog__title` memakai `title/medium`).

## 7. Layout & utilitas

- Container: lihat `layout/_container.scss` sebagai acuan terakhir (modelnya beberapa kali berubah;
  sebagian masih WIP user, termasuk beberapa `map-get` yang sengaja dibiarkan).
- Grid: `$wui-grid-columns: 12` (sumber angka tunggal) → `.wui-row`, `.wui-col`, `.wui-col-1…12`,
  varian responsif `.wui-col-<bp>-<n>`. Memakai `display: grid` + `repeat(12, minmax(0, 1fr))`,
  bukan flex + margin negatif.
- Gap: `.wui-gap-N`, `.wui-row-gap-N`, `.wui-column-gap-N` (+ varian `-<bp>-`) dari skala spacing.
  Gap **bukan** bagian `_grid.scss` karena bisa dipakai di flex mana pun.
- Flex utilities meniru nama Bootstrap dengan prefix `wui-`: `.wui-d-flex`, `.wui-flex-row`,
  `.wui-justify-content-*`, `.wui-align-items-*`, `.wui-order-*`, `.wui-flex-fill`, dst. + varian
  `-<bp>-` (pola `wui-<grup>-<bp>-<nilai>`).
- ⚠️ **Urutan sumber = mekanisme kemenangan utilitas**: hasilkan **semua class dasar dulu, baru semua
  varian breakpoint** (`sm → md → lg → xl → xxl`). Kalau blok `@media` ditaruh di dalam loop nilai,
  class dasar yang muncul belakangan akan menang dan varian responsif tampak "tidak bekerja".

## 8. Jebakan stylelint (terverifikasi)

- `scss/dollar-variable-pattern: ^wui-` berlaku juga untuk **variabel lokal di dalam mixin/fungsi**
  (`$size` ditolak → harus `$wui-size`). Parameter mixin/fungsi dikecualikan (`$step`, `$dir` boleh).
- `scss/comment-no-empty` menolak baris `//` **kosong**, termasuk di dalam blok komentar panjang.
  Pisahkan paragraf dengan baris benar-benar kosong, bukan `//`.
- `scss/dollar-variable-empty-line-before`: baris kosong **wajib** sebelum `$var` (jangan menempelkan
  di bawah deklarasi), kecuali anak pertama blok / sesudah komentar; sebaliknya baris kosong **antar
  dua variabel berurutan** justru dilarang — sisipkan komentar sebagai pemisah.
- `declaration-empty-line-before`: deklarasi biasa tidak boleh menempel langsung di bawah custom
  property `--wui-*` **atau** di bawah `@include` — wajib ada baris kosong.
- `scss/double-slash-comment-empty-line-before`: komentar `//` yang jadi anak pertama blok tidak boleh
  didahului baris kosong; sebaliknya komentar yang menggantung di tengah daftar nilai wajib didahului.
- `scss/at-if-no-null`: tulis `@if not $x` / `@if $x`, **bukan** `@if $x == null`.
- `at-rule-empty-line-before` punya `ignoreAtRules: ['else']` — kalau rule ini ditimpa, `@else` harus
  disertakan lagi, kalau tidak `@else if` jadi error.
- `max-nesting-depth: 3` (loop `@each`/`@for` tidak dihitung sedalam dugaan — aman).
- `selector-class-pattern`: hanya `wui-*`, `.is-*`, dan `.cdk-*` (untuk menimpa style CDK).
- `scss/at-import-partial-extension` sudah tidak ada; jangan dipakai.

## 9. Jebakan Sass (terverifikasi)

- `@each $x in $map` mengembalikan **pasangan key-value**, bukan key — selector hasilnya rusak
  (`$wui-m-0 0`). Pakai `map.keys($map)`.
- `#{…}` pada daftar **comma-separated** menghasilkan `a, b` (tidak valid sebagai satu nilai CSS);
  untuk `margin-block` butuh daftar spasi — bangun lewat dua nilai yang dipisah spasi.
- Di dalam **fungsi**, `#{0.1 * 100}%` bisa terserialisasi `10 %` (ada spasi) → deklarasi dibuang
  browser. Pakai aritmetika `* 100%`.
- Konfigurasi `@use 'entry' with (…)` hanya merembes lewat `@forward` (lihat §2).

## 10. Jebakan CSS & custom property (terverifikasi)

- Specificity menentukan lebih dulu daripada urutan: `&:hover:not(:disabled)` (3 class) mengalahkan
  `[aria-invalid]` (2 class). Obat: `&:where(:hover):not(:disabled)` — `:where()` menyumbang 0.
- Pola "state hanya mengubah custom property" (`--wui-field-border-color`, `--wui-button-*`) dipakai
  supaya kemenangan tidak bergantung urutan penulisan blok.
- **Self-reference custom property tidak bisa**: `--x: calc(var(--x, 16px) - 1px)` → computed value
  `""` (invalid) dan efeknya hilang **tanpa error**. Pakai variabel kedua untuk offset.
- Typo di `transition` (mis. `--wui-motion-duratio-fast`) membuat seluruh deklarasi invalid →
  `transition-property: none`.
- Animasikan **warna saja** kalau perubahan ukuran harus bergerak bersamaan (mis. `border-width` +
  padding kompensasi): kalau salah satu dianimasikan, teks berkedip 1px.
