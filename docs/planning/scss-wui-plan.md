# Planning — Paket SCSS `@wajek/wui` (Style Layer Library)

> Tujuan: memisahkan **style layer** dari komponen `@wajek/wui` sehingga setiap project (real app) bisa
> memuat style secara **manual** di `src/styles.scss`-nya sendiri, dengan kontrol penuh atas urutan,
> partial mana yang dipakai, dan override theme.

Status dokumen: **Draft untuk direview** — keputusan §0 sudah dikunci, eksekusi belum dimulai.
Stack terverifikasi dari workspace: Angular `20.3` · ng-packagr `20.3` · builder aplikasi `@angular/build:application` · builder library `@angular/build:ng-packagr` · semua style source memakai SCSS.

---

## 0. Keputusan yang sudah dikunci

| # | Keputusan | Nilai |
| --- | --- | --- |
| D1 | Nama paket library | **`@wajek/wui`** (scoped, publish publik) |
| D2 | Lokasi source SCSS di library | `projects/wui/scss/` |
| D3 | Kontrak impor di real app | `@use '@wajek/wui/scss/wui.scss';` |
| D4 | Entry file | `scss/wui.scss` — nama file literal **wajib** `wui.scss`, ditulis lengkap dengan ekstensi |

> **Revisi 1 (2026-09-15):** nama entry dikoreksi dari `scss/style.scss` → **`scss/wui.scss`**.
> Seluruh referensi di dokumen ini sudah memakai `wui.scss`.

Konsekuensi langsung dari D3 + D4 yang harus dipatuhi sepanjang proyek:

- Nama folder **`scss/`** dan nama entry **`wui.scss`** adalah bagian dari public API —
  mengubahnya = *breaking change*.
- Konsumen menulis path **lengkap sampai ekstensi**, jadi resolusi tidak boleh bergantung pada konvensi
  `_index.scss`. File `scss/wui.scss` harus benar-benar ada sebagai file nyata di dalam paket hasil build.
- Karena paket di-scope (`@wajek/...`), publish wajib `access: public` dan resolusi harus menembus
  folder scope (`node_modules/@wajek/wui/scss/wui.scss`).

---

## 1. Kondisi saat ini (hasil audit)

| Item | Temuan |
| --- | --- |
| `projects/wui/src/lib/wui.ts` | Masih komponen scaffold (`lib-wui`), belum ada komponen nyata |
| `projects/wui/ng-package.json` | Hanya `dest` + `lib.entryFile` — **tidak ada `assets`** → SCSS tak akan ikut ter-publish |
| `projects/wui/package.json` → `name` | Masih `"wui"` → harus diubah menjadi `"@wajek/wui"` |
| `projects/wui/package.json` → `sideEffects` | Bernilai `false` → berisiko CSS di-tree-shake oleh konsumen |
| `projects/wui/package.json` → `publishConfig` | Belum ada → publish paket scoped akan gagal (default restricted) |
| SCSS di library | **Belum ada sama sekali** (0 file `.scss` di `projects/wui`) |
| `src/styles.scss` (playground) | Kosong, hanya komentar |
| `angular.json` app | `styles: ["src/styles.scss"]`, belum ada `stylePreprocessorOptions` |
| `projects/wui/README.md` | Belum ada dokumentasi cara pakai style |

**Konsekuensi:** saat ini belum ada "produk style" yang bisa dikonsumsi. Yang kita bangun adalah
*kontrak konsumsi* (entry point SCSS) + *source of truth token* + *struktur file*.

---

## 2. Keputusan arsitektur

### 2.1 Lokasi source SCSS

SCSS hidup **di dalam library** (`projects/wui/scss/`), bukan di app, bukan di repo terpisah.

```
projects/wui/
├── ng-package.json
├── package.json        ← name: "@wajek/wui"
├── scss/               ← NEW: source of truth style → jadi node_modules/@wajek/wui/scss/
│   └── wui.scss        ← entry yang di-@use konsumen (D3/D4)
└── src/                ← kode komponen (TypeScript)
```

Alasan: satu versi, satu rilis, satu changelog. Komponen dan style-nya tidak bisa "kebablasan" versinya.
Jalur alternatif (paket SCSS terpisah, mis. `@wajek/wui-scss`) hanya dipilih kalau style dipakai juga oleh
framework lain (React/Vue) — kalau tidak, ini menambah beban rilis dua paket.

### 2.2 Bentuk distribusi: **SCSS source + CSS prebuilt (opsional)**

Ini bagian paling menentukan pengalaman konsumen. Rencana menyediakan **dua jalur**:

| Jalur | Bagaimana konsumen pakai | Kelebihan | Kekurangan |
| --- | --- | --- | --- |
| **A. SCSS source** (utama) | `@use '@wajek/wui/scss/wui.scss';` di `src/styles.scss` | Bisa override token & pilih partial, bisa pakai mixin, output ter-minify bersama bundle app | Butuh Sass di pipeline konsumen (Angular app: default sudah ada) |
| **B. CSS prebuilt** (sekunder) | `node_modules/@wajek/wui/scss/wui.css` masuk `angular.json → styles[]` | App non-Sass / non-Angular bisa pakai | Tidak bisa di-override di level SCSS, hanya lewat CSS variables |

Urutan pengerjaan: **A dulu** (ini yang diminta), **B menyusul** karena butuh step compile manual
(ng-packagr tidak meng-compile file SCSS global — ia hanya meneruskan file as-is sebagai `assets`).

### 2.3 Strategi Theming: CSS Custom Properties sebagai *runtime API*, SCSS map sebagai *compile-time API*

Dua lapis, sengaja dipisah:

1. **Compile-time (SCSS)**: token didefinisikan sebagai `$variables` bertanda `!default` di
   `scss/tokens/_index.scss`. Konsumen bisa menulis:

   ```scss
   @use '@wajek/wui/scss/wui.scss' with ($wui-color-primary: #0057ff);
   ```

   → token ikut ter-generate sebagai CSS variable.
   Syarat teknis: `wui.scss` harus **`@forward`** modul token (bukan cuma `@use`) agar konfigurasi bisa
   menembus, dan `@use ... with` hanya boleh muncul **sekali** di seluruh build — kalau modul sudah dimuat
   di tempat lain, Sass melempar error.
2. **Runtime (CSS)**: file yang sama meng-emit `--wui-*` di `:root`, plus blok theme di
   `[data-wui-theme="dark"]`. Konsumen bisa ganti warna **tanpa rebuild** dan bisa toggle dark mode
   hanya dengan mengganti atribut di `<html>`.

Prinsip: **komponen hanya boleh membaca `var(--wui-*)`, tidak boleh hardcode nilai.** Ini yang membuat
style layak dikonsumsi lintas project.

### 2.4 Anti-duplikasi: style komponen ditulis sebagai **mixin**

Agar satu definisi style bisa dipakai di dua konteks (global class `.wui-button` *dan* di dalam
komponen Angular ber-encapsulation), file komponen berupa **mixin**, bukan class langsung:

```scss
// projects/wui/scss/components/button.scss   ← file PUBLIK dari paket
@mixin button($size: 'md') {
  display: inline-flex;
  gap: var(--wui-space-2);
  /* ... */
}
```

- Dipakai global → `scss/components/_index.scss` men-generate `.wui-button { @include button(); }`
- Dipakai komponen → `@use '@wajek/wui/scss/components/button.scss' as btn;` lalu `:host { @include btn.button(); }`

Satu sumber, tidak ada copy-paste antar komponen.

---

## 3. Struktur folder yang diusulkan

> ⚠️ **Struktur di bawah ini DIGANTIKAN** oleh `docs/planning/scss-structure-plan.md`
> (4 level: `abstracts` → `base` → `themes` → `components`). Level `tools/`, `layout/`, dan
> `utilities/` **tidak dipakai**. Sisanya di dokumen ini (kontrak konsumsi, token, config build) masih berlaku.

```
projects/wui/scss/
│
│   ── ENTRY PUBLIK (yang di-@use konsumen — MENG-EMIT CSS) ─────────────────────
├── wui.scss                     # ★ ENTRY UTAMA (D3/D4): forward token/tools + use base,
│                                #   layout, components, themes → ini yang dipakai real app
├── tokens.scss                  # granular: token + CSS variables --wui-* di :root
├── base.scss                    # granular: reset + root
├── utilities.scss               # granular: utility class (opt-in)
│
│   ── LAYER (folder internal) ─────────────────────────────────────────────────
├── tokens/
│   ├── _index.scss              # $variables !default (source of truth)
│   ├── _colors.scss             # $wui-color-* (+ var())
│   ├── _typography.scss         # font family/size/weight/line-height
│   ├── _space.scss              # skala spasi (4/8/12/16...)
│   ├── _radius.scss
│   ├── _elevation.scss          # shadow
│   ├── _breakpoints.scss
│   ├── _motion.scss             # duration + easing
│   └── _emit-css-vars.scss      # mixin @mixin css-vars() → :root { --wui-* }
├── tools/                       # HANYA mixin/function, tidak emit CSS
│   ├── _index.scss
│   ├── _media.scss              # @mixin up($bp) / down($bp)
│   ├── _focus-ring.scss
│   └── _typography.scss         # @mixin text($style)
├── base/
│   ├── _index.scss
│   ├── _reset.scss              # normalize/reset minimal (scoped, bukan global keras)
│   └── _root.scss               # :root vars, color-scheme
├── layout/                      # object/primitif layout
│   ├── _index.scss
│   ├── _container.scss
│   ├── _stack.scss
│   └── _grid.scss
├── components/
│   ├── _index.scss              # agregator: emit .wui-* (internal, dipakai wui.scss)
│   ├── button.scss              # PUBLIK: @mixin button() — nol CSS, aman dikombinasikan
│   ├── card.scss                # PUBLIK: @mixin card()
│   └── input.scss               # PUBLIK: @mixin input()
├── utilities/
│   ├── _index.scss
│   └── _spacing.scss            # .wui-u-mt-2 dst (opt-in, tidak di-emit by default)
└── themes/
    ├── _index.scss
    ├── light.scss               # PUBLIK: blok theme light
    └── dark.scss                # PUBLIK: blok theme dark
```

Naming layer memakai pendekatan ITCSS-ringan (`tokens → tools → base → layout → components → utilities → themes`).
Urutan ini **wajib** karena Sass `@forward`/`@use` dievaluasi urut: token harus lebih dulu dari komponen.

**Aturan file (ditegakkan stylelint — lihat §5):**

- **Tanpa prefix `_` = bagian public API** → boleh di-`@use` konsumen: `wui.scss`, `tokens.scss`,
  `base.scss`, `utilities.scss`, `themes/*.scss`, `components/*.scss`.
- **Prefix `_` = internal partial** → tidak boleh di-`@use` dari luar paket.
- `wui.scss` = entry "semua sekaligus". Jangan digabung dengan `tokens.scss` + `base.scss`
  (CSS akan dobel) — pilih satu jalur, lihat §4.

---

## 4. Entry point publik (public API style)

Konsumen menulis specifier **lengkap termasuk ekstensi `.scss`**. Pemuatan tetap bisa granular:

| Entry | Isi | Emit CSS? | Contoh pemakaian |
| --- | --- | --- | --- |
| `@wajek/wui/scss/wui.scss` | **Semua layer** — token, root vars, base, layout, komponen, theme | ✅ | `@use '@wajek/wui/scss/wui.scss';` |
| `@wajek/wui/scss/tokens.scss` | Hanya token + CSS variables `--wui-*` di `:root` | ✅ | `@use '@wajek/wui/scss/tokens.scss';` |
| `@wajek/wui/scss/base.scss` | Reset + root | ✅ | `@use '@wajek/wui/scss/base.scss';` |
| `@wajek/wui/scss/utilities.scss` | Utility class (opsional) | ✅ | `@use '@wajek/wui/scss/utilities.scss';` |
| `@wajek/wui/scss/themes/dark.scss` | Blok theme dark | ✅ | `@use '@wajek/wui/scss/themes/dark.scss';` |
| `@wajek/wui/scss/components/button.scss` | Mixin satu komponen | ❌ (murni mixin) | `@use '@wajek/wui/scss/components/button.scss' as btn;` |
| `@wajek/wui/scss/wui.css` *(prebuilt, fase akhir)* | CSS siap pakai | — | `angular.json → styles[]` |

**Aturan wajib (agar CSS tidak dobel):**

1. Entry yang **emit CSS** bersifat saling eksklusif. Pilih **satu** pola, jangan campur:
   - **Pola simple (rekomendasi):** hanya `wui.scss`.
   - **Pola granular:** `tokens.scss` + `base.scss` + (opsional `utilities.scss`, `themes/*.scss`).
2. File **komponen** (`scss/components/*.scss`) tidak emit CSS → aman dipakai bersama entry apa pun.
3. Semua `@use` entry hanya di `src/styles.scss`. **Jangan** di-`@use` dari SCSS komponen atau lazy-loaded
   route — CSS bisa ikut ter-inject ke chunk lazy dan dobel.
4. Tidak ada `@import` (deprecated di dart-sass 1.80+, dihapus di 3.0) dan tidak ada prefix `~` (warisan
   webpack) — hanya `@use` / `@forward`.

**Agar semua specifier resolve:**

- `wui.scss` harus benar-benar ada sebagai file di `scss/` (bukan mengandalkan konvensi `_index.scss`),
  karena konsumen menulis path lengkap.
- Semua file tanpa prefix `_` di `scss/` ikut ter-*copy* ke `dist` lewat `assets` (§6.1) dan tidak
  diblokir oleh `exports` (§6.2).
- Resolusi `node_modules/@wajek/wui/...` wajib diuji nyata di Fase 5 (§8).

---

## 5. Konvensi (dibekukan di fase 0, wajib konsisten)

- **File**: kebab-case. Prefix `_` = internal partial (`_index.scss` per folder), tanpa prefix = public API.
  Nama folder `scss/` dan file `wui.scss` **dibekukan** karena bagian dari kontrak `@use` konsumen (D3/D4).
- **Class**: prefix `wui-` · BEM ringan → `.wui-button`, `.wui-button__icon`, `.wui-button--lg`, `.wui-button.is-loading`.
- **CSS variable**: `--wui-<kategori>-<nama>[-<varian>]` → `--wui-color-primary`, `--wui-space-4`.
- **SCSS variable**: `$wui-<...>` dan **selalu** `!default` di token.
- **Prefix**: tetap `wui-` / `--wui-` / `$wui-` walau paket bernama `@wajek/wui` — scope hanya namespace
  NPM, prefix class tidak perlu ikut panjang.
- **State**: pakai class `.is-*` (bukan attribute) + pseudo-class native bila memungkinkan.
- **Spesifisitas**: maksimal 1 level nesting sedalam mungkin; dilarang `!important` kecuali utility.
- **Tidak ada selector global agresif** (`*`, `div`, `button`) di luar `base/_reset.scss`, dan reset
  harus opt-in supaya tidak "menabrak" style app konsumen.
- **Dokumentasi**: setiap file token punya komentar atas: deskripsi + nilai default + contoh override.

---

## 6. Perubahan konfigurasi yang dibutuhkan

### 6.1 `projects/wui/ng-package.json` — kirim SCSS sebagai asset

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/@wajek/wui",
  "assets": ["./scss/**/*.scss", "./scss/**/*.css", "./README.md"],
  "lib": { "entryFile": "src/public-api.ts" }
}
```

Path `assets` relatif terhadap lokasi `ng-package.json`, jadi `./scss/...` mengarah ke
`projects/wui/scss/...` dan hasilnya muncul persis di `dist/@wajek/wui/scss/wui.scss`
→ setelah publish menjadi `node_modules/@wajek/wui/scss/wui.scss`. **Inilah yang membuat D3 bisa resolve di real app.**

> Catatan desain: `dest` memakai folder literal `@wajek` sehingga struktur di `dist` **meniru** struktur
> scoped package. Konsekuensinya playground bisa memakai specifier yang identik dengan real app hanya dengan
> `includePaths: ["dist"]` (§6.3) — tanpa symlink dan tanpa `npm link`.

### 6.2 `projects/wui/package.json` — nama paket, akses publish, jangan biarkan CSS ter-*tree-shake*

```json
{
  "name": "@wajek/wui",
  "version": "0.0.1",
  "publishConfig": { "access": "public" },
  "sideEffects": ["**/*.css", "**/*.scss"]
}
```

- `publishConfig.access: public` **wajib** untuk paket scoped — default-nya restricted sehingga publish gagal (403).
- `sideEffects` diubah dari `false` → mencegah CSS/SCSS dihapus oleh tree-shaking konsumen.
- **`exports` sengaja TIDAK ditulis di source** — lihat temuan di bawah.

#### ✅ Temuan Fase 0 (terverifikasi 2026-09-15)

`ng build wui` menghasilkan `dist/@wajek/wui/package.json` yang berisi `exports` **hasil generate ng-packagr**,
hanya dua entry:

```json
"exports": {
  "./package.json": { "default": "./package.json" },
  ".": { "types": "./index.d.ts", "default": "./fesm2022/wajek-wui.mjs" }
}
```

Konsekuensinya:

- `exports` yang ditulis manual di `projects/wui/package.json` **ditimpa total** → subpath SCSS hilang.
- Karena `exports` ada dan bersifat membatasi subpath, resolver yang menghormati `exports` akan **menolak**
  `@use '@wajek/wui/scss/wui.scss'`. Ini persis risiko yang diprediksi di §10 — sekarang **terkonfirmasi**.
- Nama bundle terkonfirmasi: `fesm2022/wajek-wui.mjs`.
- **Tidak berpengaruh untuk dev di workspace ini**, karena playground memakai `includePaths` (§6.3), bukan
  resolusi `node_modules`. Yang terpengaruh hanya konsumsi dari registry.

**Status: BELUM ditangani — sengaja dipending ke Fase 5.** Percobaan pertama memakai script patch pasca-build,
tapi script itu sudah dihapus (folder `tools/` dibubarkan). Jadi saat konsumsi dari registry nanti ada dua
kemungkinan:

1. Resolver Angular **tidak** menghormati `exports` → D3 tetap berhasil, tidak ada yang perlu dilakukan.
2. Resolver **menghormati** `exports` → subpath `./scss/*` diblokir dan D3 gagal. Solusinya salah satu:
   sisipkan `"./scss/*": "./scss/*"` ke `dist/@wajek/wui/package.json` **sebelum** `npm publish`, atau
   pindahkan SCSS ke *secondary entry point* supaya ikut terdaftar oleh ng-packagr.

**Fase 5 wajib membuktikan yang mana yang terjadi** sebelum paket dipakai real app.

### 6.3 `angular.json` — `includePaths` untuk dev di workspace

```json
// projects.wui-angular.architect.build.options DAN .test.options
"stylePreprocessorOptions": { "includePaths": ["dist"] }
```

Inilah yang membuat playground bisa menulis specifier **identik dengan real app** tanpa publish:
`includePaths` menambahkan `dist` sebagai load path, lalu `@wajek/wui/scss/wui.scss` di-resolve ke
`dist/@wajek/wui/scss/wui.scss`.

**✅ Terverifikasi di container** (`wui_angular_dev`): `npx ng build --configuration development` sukses dan
`www/styles.css` berisi token dari library.

Target `test` **wajib** diberi konfigurasi yang sama karena `@angular/build:karma` juga meng-compile
`src/styles.scss` — tanpa itu `ng test` gagal dengan pesan error yang sama.

### 6.4 `package.json` root — script tambahan

Hanya satu script tambahan yang dipertahankan:

```json
{
  "scripts": {
    "lint:styles": "stylelint \"projects/wui/scss/**/*.scss\""
  }
}
```

Sisanya sengaja **tidak** ditambah — build library cukup `ng build wui`, dan watch cukup
`ng build wui --watch` + `npm run watch` (§7.3).

Untuk Fase 6 (CSS prebuilt) nanti, step kompilasinya harus dijalankan **setelah** `ng build wui`, karena
ng-packagr membersihkan `dest` lebih dulu:

```bash
sass --no-source-map projects/wui/scss/wui.scss dist/@wajek/wui/scss/wui.css
```

---

## 7. Cara konsumsi di project app (hasil akhir yang diinginkan)

### 7.1 Cara utama — manual di `src/styles.scss` (kontrak resmi D3)

```scss
// src/styles.scss   ← inilah satu-satunya baris yang dibutuhkan
@use '@wajek/wui/scss/wui.scss';

// override token global (opsional, tanpa menyentuh source library)
:root {
  --wui-color-primary: #0057ff;
  --wui-radius-base: 10px;
}
```

Tidak ada langkah lain: tanpa entri di `angular.json → styles[]`, tanpa copy-paste file.
Kalau ternyata Angular masih butuh `includePaths`, itu temuan Fase 5 dan **wajib** didokumentasikan di
README konsumen — jangan sampai jadi "konfigurasi tersembunyi" (lihat §10).

Pemuatan granular (kalau app ingin memilih partial sendiri — **jangan** dicampur dengan `wui.scss`):

```scss
// src/styles.scss
@use '@wajek/wui/scss/tokens.scss';
@use '@wajek/wui/scss/base.scss';
@use '@wajek/wui/scss/themes/dark.scss';
```

Memakai mixin komponen di SCSS komponen app (aman, tidak emit CSS):

```scss
// my-page.component.scss
@use '@wajek/wui/scss/components/button.scss' as btn;

.wui-button--hero { @include btn.button('lg'); }
```

Override token di level SCSS (compile-time):

```scss
// src/styles.scss — `with (...)` hanya boleh ada di SATU tempat dan paling awal
@use '@wajek/wui/scss/wui.scss' with (
  $wui-color-primary: #0057ff,
  $wui-font-family-base: ('Inter', sans-serif)
);
```

### 7.2 Dark mode

Theme dipilih manual oleh app (konsisten dengan D5) lalu diaktifkan lewat atribut:

```scss
@use '@wajek/wui/scss/wui.scss';
@use '@wajek/wui/scss/themes/dark.scss';   // opsional, kalau app butuh dark mode
```

```html
<html data-wui-theme="dark">
```

### 7.3 Playground app di workspace ini (✅ terverifikasi di container 2026-09-15)

Specifier yang dipakai di playground **identik** dengan real app:

```scss
// src/styles.scss
@use '@wajek/wui/scss/wui.scss';
```

Resolusi di playground **tidak** lewat `node_modules`, tapi lewat `includePaths` (§6.3):

```bash
ng build wui        # hasil ke dist/@wajek/wui
```

```json
// angular.json → build.options & test.options
"stylePreprocessorOptions": { "includePaths": ["dist"] }
```

Struktur `dist/@wajek/wui` sengaja dibuat meniru scoped package, sehingga specifier di atas menemukan
`dist/@wajek/wui/scss/wui.scss` — **tanpa** symlink, tanpa `npm link`, dan tanpa mengubah specifier.

#### ❌ Jebakan: `tsconfig.json → compilerOptions.paths` TIDAK memperbaiki SCSS

`paths` hanya memengaruhi resolusi **TypeScript / bundler JS**. Resolusi Sass berjalan sendiri
(loadPaths + `node_modules`), jadi `paths` tidak pernah dibaca oleh `plugin angular-sass`.

Dibuktikan di container `wui_angular_dev`:

| Kondisi | Hasil |
| --- | --- |
| `paths: { "@wajek/wui": ["./dist/@wajek/wui"] }`, tanpa apa pun di `node_modules` | ✘ `Can't find stylesheet to import` |
| Tanpa `paths`, tapi ada symlink `node_modules/@wajek/wui` → hasil build | ✔ build sukses |
| Tanpa `paths`, tapi dengan `includePaths: ["dist"]` + `dest` = `dist/@wajek/wui` | ✔ build sukses |

`paths` tetap dipakai untuk import **TypeScript** (`import { ... } from '@wajek/wui'`), tapi bukan solusi
untuk `@use`. Di era builder webpack dulu, `sass-loader` ikut membaca pembaliasan webpack sehingga `paths`
terasa "berhasil" — perilaku itu **tidak berlaku lagi** di builder esbuild `@angular/build`.

#### Alur watch dua proses

```bash
# terminal 1 — library
ng build wui --watch

# terminal 2 — app
npm run watch         # ng build --watch --configuration development
```

#### ⚠️ Perlu Anda verifikasi saat menjalankan dua watch

Apakah app rebuild ikut ter-*trigger* ketika file SCSS di library berubah?
Dari kode `@angular/build`: semua dependency hasil resolve dimasukkan ke `watchFiles`, dan `dist/` **tidak**
ada di daftar ignore (`ignored` hanya berisi output `./www`, folder cache, dan dot-folder) — jadi teorinya
terdeteksi. **Namun ini belum diuji.**
Cara mengujinya: jalankan dua watch di atas, ubah `projects/wui/scss/wui.scss`, lalu lihat apakah terminal 2
melakukan rebuild. Kalau tidak ter-trigger, cukup restart proses app (style global tetap ikut ter-*reload*
saat `ng serve`).

---

## 8. Roadmap fase

### Fase 0 — Fondasi & keputusan (0.5 hari)

- [x] ~~Konfirmasi §2.1 / §2.2~~ → **dikunci sebagai D1–D5 di §0**
- [x] `projects/wui/package.json`: `name` → `@wajek/wui`, `publishConfig.access: public`, `sideEffects` diperbaiki
- [x] `projects/wui/ng-package.json`: `dest` → `dist/@wajek/wui`, `assets` SCSS (terbukti ikut ter-copy)
- [x] Buat `scss/wui.scss` placeholder + buktikan lewat `ng build wui`
- [x] Verifikasi `sass` tersedia untuk pipeline build
- [x] Konvensi §5 dibekukan di `projects/wui/README.md`
- [x] Lint SCSS: `stylelint` + `stylelint-config-standard-scss` + `.stylelintrc.json` + script `lint:styles`
- [x] Playground bisa memakai specifier asli via `includePaths: ["dist"]` (§6.3) — terbukti, build sukses
- [ ] Subpath SCSS di `exports` → **belum ditangani**, sengaja dipending ke Fase 5 (§6.2)

**Output:** nama paket final, folder `scss/` ada, tooling lint jalan.
**DoD — TERPENUHI:** `npm run lint:styles` exit 0, dan `ng build wui` menghasilkan
`dist/@wajek/wui/scss/wui.scss` — mekanisme `assets` terbukti sebelum menulis style apa pun.

### Fase 1 — Token layer (1–1.5 hari)

- [ ] Buat `scss/tokens/*` (colors, typography, space, radius, elevation, breakpoints, motion)
- [ ] Semua variabel `!default`, grup dalam map kalau perlu loop
- [ ] Buat `scss/tokens/_emit-css-vars.scss`: `@mixin css-vars() { :root { --wui-*: ... } }`
- [ ] Buat `scss/base/_root.scss` yang memanggil mixin tersebut
- [ ] Buat entry `scss/tokens.scss` (satu-satunya file yang emit token)
- [ ] Buat dokumentasi token (tabel nama → nilai → contoh override)

**Output:** `dist/@wajek/wui/scss/tokens/*.scss` + `tokens.scss` ikut ter-publish.
**DoD:** `@use '@wajek/wui/scss/tokens.scss';` menghasilkan `--wui-*` lengkap di `:root`; nol hardcoded color.

### Fase 2 — Tools, base, layout (1 hari)

- [ ] `scss/tools/_media.scss` (`up()`, `down()`, `between()`), `_focus-ring.scss`, `_typography.scss`
- [ ] `scss/base/_reset.scss` (opt-in, minimal, tidak agresif) + `scss/base/_index.scss`
- [ ] `scss/layout/_container.scss`, `_stack.scss`, `_grid.scss`
- [ ] Entry `scss/base.scss`
- [ ] Rakit entry utama `scss/wui.scss`: `@forward 'tokens'` (agar `with (...)` bisa menembus) lalu
      `@use` layer yang emit CSS — **urutan wajib**: tokens → base → layout → components → (utilities, themes)

**Output:** entry `@wajek/wui/scss/wui.scss` berfungsi end-to-end.
**DoD:** reset + layout ter-render benar di playground; tidak ada selector yang membocor ke elemen app.

### Fase 3 — Komponen (mengikuti komponen `wui` yang ada, rolling)

- [ ] Pola murni mixin (§2.4): `scss/components/button.scss` dst **tanpa** prefix `_` (public API)
- [ ] `scss/components/_index.scss` sebagai agregator `.wui-*` (internal, dipakai `wui.scss`)
- [ ] Mulai dari 2–3 komponen awal (button, input, card) sebagai pola acuan
- [ ] Selaraskan dengan komponen TS: selector class `wui-*`, `ViewEncapsulation` tetap default (emulated)
- [ ] `scss/utilities/_spacing.scss` + entry `scss/utilities.scss` (opt-in)

**Output:** komponen bisa dipakai dua cara (global class / mixin di komponen).
**DoD:** tidak ada duplikasi style antar context; contoh di playground pakai keduanya.

### Fase 4 — Theme & dokumentasi (1 hari)

- [ ] `scss/themes/light.scss` + `dark.scss` (**public**, tanpa prefix `_`) via `[data-wui-theme]`
- [ ] `scss/themes/_index.scss` (`@forward` + helper mixin `enable-dark-mode()`)
- [ ] Tulis `projects/wui/README.md` dengan contoh **copy-paste-able**:
      `npm i @wajek/wui` → `@use '@wajek/wui/scss/wui.scss';` → daftar entry → daftar token → cara override
- [ ] Tulis contoh project konsumen minimal (snippet `styles.scss` + catatan `angular.json`)

**Output:** dokumentasi resmi konsumsi.
**DoD:** developer lain bisa mengikuti README tanpa bertanya.

### Fase 5 — Verifikasi konsumsi nyata (0.5–1 hari)

- [ ] `ng build wui` → cek `dist/@wajek/wui/scss/wui.scss` ada dan lengkap
- [ ] `npm pack` dari `dist/@wajek/wui` → install tarball ke project Angular dummy
- [ ] Di project dummy: `@use '@wajek/wui/scss/wui.scss';` di `src/styles.scss` → **pembuktian D3**
- [ ] Uji kasus gagal: `exports` map, paket scoped (`node_modules/@wajek/wui`), npm vs yarn vs pnpm,
      monorepo dengan `node_modules` di parent, `stylePreprocessorOptions` kosong vs terisi
- [ ] Catat konfigurasi minimum yang benar-benar dibutuhkan di README konsumen

**Output:** laporan "terbukti jalan di project app terpisah".
**DoD:** build app dummy sukses tanpa `includePaths` tambahan **atau** README mendokumentasikan
workaround yang dibutuhkan secara eksplisit.

### Fase 6 — Distribusi CSS prebuilt (opsional, 0.5 hari)

- [ ] Compile `scss/wui.scss` → `scss/wui.css` (+ `.min.css`) dengan step `sass` eksplisit,
      dijalankan **setelah** `ng build wui`
- [ ] Pastikan `wui.css` tidak terhapus saat ng-packagr membersihkan `dest` (urutan script penting)
- [ ] Dokumentasi jalur B di README (`angular.json → styles[]`)
- [ ] (Opsional) `purgecss`/audit ukuran untuk kontrol budget

**Output:** jalur konsumsi untuk app non-Sass.

---

## 9. Strategi verifikasi & kualitas

1. **Compile check**: `sass projects/wui/scss/wui.scss /tmp/out.css` — menangkap error sintaks tanpa app.
2. **Lint**: `stylelint` (standard-scss + `stylelint-order`) untuk urutan & konvensi nama.
3. **Budget**: `anyComponentStyle` saat ini 4kB warn / 8kB error; budget global 500kB warn / 1MB error —
   style global ikut terhitung di initial bundle, jadi tambahkan cek ukuran di fase 6.
4. **Visual/regresi**: halaman playground di `src/` yang merender semua token + komponen (semacam storybook mini).
5. **Kontrak token**: test sederhana yang meng-compile SCSS lalu memastikan semua `--wui-*` yang
   didokumentasikan benar-benar ter-emit (deteksi token "dokumen tapi tidak ada").
6. **Uji konsumen**: satu project Angular dummy di CI (Fase 5) agar regresi resolusi `@use` ketahuan awal.
7. **Audit specifier**: cek otomatis bahwa tidak ada `@import`, prefix `~`, atau hardcoded hex/px di luar
   `scss/tokens/` — inilah yang menjaga kualitas style saat dipakai lintas project.

---

## 10. Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| `@use '@wajek/wui/scss/wui.scss'` gagal resolve di app konsumen | Blocker adopsi — kontrak D3 tidak jalan | **Wajib diverifikasi di Fase 5.** Fallback berurutan: (1) `stylePreprocessorOptions.includePaths: ["node_modules", "../node_modules"]`, (2) path relatif `@use '../node_modules/@wajek/wui/scss/wui.scss'`, (3) tambahkan `"./scss/*": "./scss/*"` ke `dist/@wajek/wui/package.json` sebelum publish |
| `exports` di `dist/@wajek/wui/package.json` membatasi subpath SCSS | Subpath granular tidak jalan saat konsumsi dari registry | **TERKONFIRMASI di Fase 0**: ng-packagr menimpa `exports` dan menghapus entry SCSS. **Belum dimitigasi** (script patch sudah dihapus) → wajib diputuskan di Fase 5 (§6.2). Tidak berdampak pada dev di workspace (§6.3) |
| Paket scoped `@wajek/*` default-nya restricted | `npm publish` gagal (403) | Tambahkan `publishConfig: { "access": "public" }` (§6.2) |
| Folder scope membuat path lebih dalam (`node_modules/@wajek/wui/...`) | Resolusi bisa beda di monorepo/pnpm | Uji Fase 5 minimal pada 2 package manager |
| `sideEffects: false` membuat CSS hilang di konsumen | Style "tidak muncul" misterius | Ubah ke `["**/*.css", "**/*.scss"]` (§6.2) |
| Sass `@import` deprecated (1.80+) / dihapus di 3.0 | Build konsumen rusak saat upgrade | Full `@use`/`@forward` sejak awal, larang `@import` via stylelint rule |
| Reset global menabrak style app | Komplain konsumen | Reset opt-in, tidak ada `*`/tag selector agresif, semua di-scope ke `:where(.wui-scope)` bila perlu |
| Partial ter-*compile* sebagai CSS terpisah oleh tooling konsumen | Output ganda / error | Aturan prefix: `_` = internal, tanpa prefix = public (§3); dokumentasikan bahwa konsumen hanya boleh `@use` file: `wui.scss`, `tokens.scss`, `base.scss`, `utilities.scss`, `themes/*.scss`, `components/*.scss` |
| `@use ... with (...)` muncul dua kali / modul sudah dimuat duluan | Error Sass yang membingungkan | Dokumentasikan: konfigurasi SCSS hanya di `src/styles.scss`; cara override yang direkomendasikan tetap CSS variable |
| ng-packagr tidak meng-compile SCSS global → CSS prebuilt tidak ada | Jalur B tertunda | Fase 6 pakai step `sass` eksplisit (`scss/wui.scss` → `scss/wui.css`), bukan berharap dari ng-packagr |
| Dua API theming (SCSS `with` + CSS var) membingungkan | Dokumentasi tidak konsisten | Tetapkan aturan: **SCSS `with` = saat butuh mengubah nilai yang di-generate (font stack, skala)**, **CSS var = untuk runtime/branding**. Tulis di README. |
| Style masuk initial bundle → melebihi budget | Build error di app konsumen | Set ekspektasi ukuran di README; sediakan entry granular + utilities opt-in |

---

## 11. Yang perlu Anda putuskan sebelum eksekusi

1. ~~**Nama paket & scope**~~ → **`@wajek/wui`** ✅ (D1)
2. ~~**Cara impor di real app**~~ → `@use '@wajek/wui/scss/wui.scss';` ✅ (D3/D4, direvisi dari `style.scss`)
3. **Level reset**: tanpa reset, reset minimal, atau normalize penuh?
4. **Bentuk API component style**: prefix class `wui-` sudah final? (rekomendasi dokumen: dipertahankan)
5. **Dark mode**: `[data-wui-theme]` di `<html>`, atau `.wui-theme-dark` di element manapun?
6. **Utilities**: di-emit bersama `wui.scss`, atau benar-benar opt-in lewat `scss/utilities.scss`?
7. **CSS prebuilt (Fase 6)**: dibutuhkan sekarang atau nanti (ada konsumen non-Sass)?
8. ~~**`dest` build**~~ → `dist/@wajek/wui` ✅ — folder literal `@wajek` membuat struktur `dist` **meniru**
   scoped package, sehingga playground bisa memakai specifier yang sama dengan real app cukup lewat
   `includePaths: ["dist"]` (§6.3).
9. **Style guide visual** yang jadi acuan (Figma/design token lain) — untuk mengisi nilai token di Fase 1.

---

## 12. Ringkasan deliverable akhir

1. `projects/wui/scss/**` — style layer lengkap (token, tools, base, layout, components, utilities, themes).
2. `projects/wui/package.json` bernama `@wajek/wui` + `ng-package.json` dengan `assets` SCSS (§6.1, §6.2).
3. `node_modules/@wajek/wui/scss/wui.scss` ter-resolve via `@use '@wajek/wui/scss/wui.scss'`
   — **dibuktikan di project app terpisah** (§7.1, Fase 5).
4. Dokumentasi konsumsi di `projects/wui/README.md` (instalasi, entry point, token, theming, troubleshooting).
5. Pipeline kualitas: stylelint, compile check, dan (opsional) CSS prebuilt.

**Definisi sukses utama:** di project app baru, cukup menulis satu baris ini di `src/styles.scss`:

```scss
@use '@wajek/wui/scss/wui.scss';
```

…lalu style langsung bekerja — tanpa langkah ajaib, tanpa copy-paste file, tanpa konfigurasi tersembunyi
selain yang didokumentasikan.
