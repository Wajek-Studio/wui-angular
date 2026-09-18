# Planning — Penyusunan Ulang SCSS `@wajek/wui` (4 Level + Pola Komponen)

> Tujuan: menata ulang `projects/wui/scss/` mengikuti struktur 4 level
> (**abstracts → base → themes → components**) dengan satu entry `scss/wui.scss`,
> dan menetapkan **pola wajib yang diterapkan di setiap komponen** yang dibuat di project `wui`.

Status: **Draft untuk direview** — belum ada file yang dipindahkan.
Dokumen terkait: `docs/planning/scss-wui-plan.md` (kontrak distribusi & konsumsi),
`docs/planning/wui-app-page-stack-plan.md` (konsumsi `WuiApp`/`WuiPage*`).

---

## 0. Keputusan yang dikunci dari arahan Anda

| # | Keputusan | Nilai |
| --- | --- | --- |
| S1 | Struktur folder | 4 level: `scss/abstracts` → `scss/base` → `scss/themes` → `scss/components` |
| S2 | Entry point | `scss/wui.scss` **memanggil mixin** dari setiap file layer (bukan menulis style sendiri) |
| S3 | Kontrak konsumen | Tetap `@use '@wajek/wui/scss/wui.scss';` di `src/styles.scss` (tidak berubah) |
| S4 | Level 1 tanpa output | `abstracts/` **tidak boleh** menghasilkan CSS sama sekali |
| S5 | Cakupan pola | Pola diterapkan **di setiap komponen** yang dibuat di project `wui` |
| S6 | Level `layout/` & `utilities/` | **Tidak dipakai** — cukup 4 level (abstracts → base → themes → components) |
| S7 | Pola file | Setiap file SCSS memuat **mixin**; `wui.scss` yang memanggil. Copot pemakaian = hapus baris `@include` di `wui.scss` |
| S8 | Theming | Otomatis lewat **`prefers-color-scheme`** — 3 warna per mode: `background`, `text`, `primary` |

---

## 1. Kondisi saat ini

```
projects/wui/scss/
├── tokens/                    # ← dipindahkan ke abstracts/
│   ├── _z-index.scss          #   $wui-z-base, $wui-z-overlay
│   ├── _motion.scss           #   $wui-motion-*
│   ├── _overlay.scss          #   $wui-overlay-color, $wui-page-radius
│   └── _index.scss            #   @forward + @mixin css-vars()  ← emit :root
├── components/
│   ├── _app-shell.scss        # emit .wui-app__overlay-host + .wui-page-layer
│   └── _index.scss            # @forward 'app-shell'
└── wui.scss                   # @forward tokens + components, @include tokens.css-vars
```

Yang **tidak cocok** dengan struktur target:

| Masalah | Kenyataan sekarang |
| --- | --- |
| Belum ada `abstracts/` | Token tersebar di `tokens/` |
| Belum ada `base/` | Reset & tipografi belum ada |
| Belum ada `themes/` | Emisi CSS variable ada di `tokens/_index.scss`, padahal itu tugas theme |
| `_functions.scss` & `_mixins.scss` belum ada | Belum ada fungsi/mixin global |
| Belum ada pemisahan tegas "murni mixin" vs "emit" | `_app-shell.scss` meng-emit, file lain belum punya aturan |

---

## 2. Struktur target

```
projects/wui/
├── scss/
│   ├── abstracts/       // Level 1: Fondasi (tanpa output CSS)
│   │   ├── _tokens.scss     // Design tokens (warna, spacing, tipografi, z-index, motion)
│   │   ├── _functions.scss  // Fungsi SCSS kustom
│   │   ├── _mixins.scss     // Mixin global
│   │   └── _index.scss      // Forward semua file di folder ini
│   │
│   ├── base/            // Level 2: Reset & tipografi dasar
│   │   ├── _reset.scss
│   │   ├── _typography.scss
│   │   └── _index.scss
│   │
│   ├── themes/          // Level 3: Definisi tema (light/dark/brand)
│   │   ├── _light-theme.scss
│   │   ├── _dark-theme.scss
│   │   └── _index.scss
│   │
│   ├── components/      // Level 4: Style spesifik komponen
│   │   ├── _button.scss
│   │   ├── _card.scss
│   │   ├── _app-shell.scss
│   │   └── _index.scss
│   │
│   ├── layout/          // Level 5: Primitif layout (class murni, tanpa komponen Angular)
│   │   ├── _container.scss
│   │   └── _index.scss
│   │
│   ├── utilities/       // Level 6: Class bantu (dipanggil paling akhir)
│   │   ├── _spacing.scss
│   │   └── _index.scss
│   │
│   └── wui.scss        // Entry point yang meng-@forward semua layer
```

> **Catatan (keputusan S6):** level `layout/` dan `utilities/` awalnya **tidak dipakai**. Keduanya
> ditambahkan **setelah** `components/` sesuai catatan ini: `utilities/` (level 6, spacing — dipanggil
> paling akhir supaya menang tanpa `!important`) dan `layout/` (level 5, primitif layout).
>
> **`layout/_container.scss` (17 Sep 2026)** — container ala Bootstrap 5, diminta user sebagai titik
> awal (`container`, `container-fluid`, `container-{sm…xxl}`). Token baru di `abstracts/_tokens.scss`:
> `$wui-breakpoints` (576/768/992/1200/1400), `$wui-container-max-widths` (540/720/960/1140/1320),
> `$wui-container-gutter-x` (1.5rem → padding 12px tiap sisi). Lebar maksimum & gutter dibaca dari
> CSS variable (bisa ditimpa runtime); breakpoint tetap compile-time karena media query tidak bisa
> memakai `var()`. `a.media-up()` diubah ke notasi **range** (`width >= …`) agar lolos
> `media-feature-range-notation` — bundler menormalkannya kembali ke `min-width` di output app.

---

## 3. Tanggung jawab tiap level

| Level | Folder | Isi file | Dipanggil di `wui.scss`? |
| --- | --- | --- | --- |
| 1 | `abstracts/` | `$variable`, `@function`, `@mixin` — **tanpa selector** | Tidak (dipakai layer lain) |
| 2 | `base/` | `@mixin reset()`, `@mixin typography()` | Ya |
| 3 | `themes/` | `@mixin light-theme()`, `@mixin dark-theme()` → meng-emit `--wui-*` | Ya |
| 4 | `components/` | `@mixin <nama>()` per komponen | Ya |

**Urutan wajib** saat memanggil: `abstracts` → `base` → `themes` → `components`. Komponen membaca
`var(--wui-*)` yang didefinisikan tema, jadi tema harus ter-emit lebih dulu.

### Pemisahan token: SCSS variable vs CSS custom property

`abstracts` tidak boleh emit, sehingga emisi CSS variable terjadi di `themes/`:

```
abstracts/_tokens.scss     $wui-light-primary: #0057ff !default;              (compile-time)
themes/_light-theme.scss   :root { --wui-color-primary: #{$wui-light-primary}; }
themes/_dark-theme.scss    @media (prefers-color-scheme: dark) { :root { … } }
```

Komponen **selalu** membaca `var(--wui-*)`, tidak pernah `$wui-*` — supaya nilainya bisa di-override
runtime tanpa rebuild, dan supaya pergantian mode terang/gelap tidak perlu diketahui komponen.

---

## 4. Bentuk `wui.scss` & theming

Entry point **memanggil mixin** dari setiap file layer. Tidak ada style yang ditulis langsung di sini —
tugasnya cuma menyalakan layer, dan mencopot sesuatu cukup dengan menghapus satu baris.

```scss
// Entry point style layer @wajek/wui.
// Konsumen: @use '@wajek/wui/scss/wui.scss';
@use 'base';
@use 'themes';
@use 'components';

// ── Salakan layer. Hapus barisnya kalau tidak ingin dipakai. ────────────────
@include base.reset;
@include base.typography;
@include themes.light-theme;
@include themes.dark-theme;
@include components.app-shell;
// @include components.button;   ← contoh: dimatikan dulu
```

Aturannya:

- Setiap file di `base/`, `themes/`, dan `components/` berisi **satu mixin** yang namanya sama dengan
  nama filenya (`_reset.scss` → `reset()`, `_dark-theme.scss` → `dark-theme()`, `_button.scss` → `button()`).
- `abstracts/` tidak dipanggil di sini — isinya token/fungsi/mixin yang dipakai layer lain.
- Satu baris `@include` = satu keputusan pakai/copot. Tidak ada efek samping ke layer lain.
- **Urutan `@include` penting**: `themes` harus sebelum `components`, kalau tidak komponen memakai
  `var(--wui-*)` yang belum didefinisikan — nilainya kosong dan **tidak ada error**, hanya tampilan salah.

### 4.1 Theming dengan `prefers-color-scheme`

**Cara kerjanya singkat:** `prefers-color-scheme` adalah media query CSS yang membaca preferensi
**OS/browser** pengguna (`light` atau `dark`). Tidak ada JavaScript, tidak ada atribut, tidak ada toggle —
browser yang menentukan, dan nilainya berubah otomatis begitu pengguna mengganti tema sistem.

Konsekuensinya: **pengguna tidak bisa memilih tema dari dalam aplikasi.** Kalau nanti butuh toggle manual,
polanya adalah media query sebagai default + class/atribut sebagai override di atasnya. Itu keputusan
lanjutan, bukan sekarang.

#### Tiga warna × dua mode — `abstracts/_tokens.scss`

```scss
// Warna — mode terang
$wui-light-background: #ffffff !default;
$wui-light-text: #1a1a1a !default;
$wui-light-primary: #0057ff !default;

// Warna — mode gelap
$wui-dark-background: #121212 !default;
$wui-dark-text: #f5f5f5 !default;
$wui-dark-primary: #6ea8ff !default;
```

#### `themes/_light-theme.scss` — default, tanpa media query

```scss
@use '../abstracts' as a;

/// Tema terang. Dipasang tanpa media query supaya jadi nilai default.
@mixin light-theme {
  :root {
    color-scheme: light;
    --wui-color-background: #{a.$wui-light-background};
    --wui-color-text: #{a.$wui-light-text};
    --wui-color-primary: #{a.$wui-light-primary};
  }
}
```

#### `themes/_dark-theme.scss` — mengikuti preferensi sistem

```scss
@use '../abstracts' as a;

/// Tema gelap. Hanya aktif kalau OS/browser pengguna memilih dark.
@mixin dark-theme {
  @media (prefers-color-scheme: dark) {
    :root {
      color-scheme: dark;
      --wui-color-background: #{a.$wui-dark-background};
      --wui-color-text: #{a.$wui-dark-text};
      --wui-color-primary: #{a.$wui-dark-primary};
    }
  }
}
```

**Nama CSS variable-nya sengaja sama** untuk kedua mode (`--wui-color-background`, dst) — yang berbeda
hanya nilainya. Jadi komponen cukup menulis `background: var(--wui-color-background)` sekali dan tidak
perlu tahu ada dua mode.

`color-scheme` di dalam blok tema penting supaya kontrol bawaan browser (scrollbar, `input`, `select`)
ikut menyesuaikan warna — tanpa itu, bagian-bagian itu tetap terang di mode gelap.

**Cara menguji tanpa mengubah setting OS:** di Chrome DevTools → panel **Rendering** →
*Emulate CSS media feature prefers-color-scheme* → pilih `dark`. Di Firefox bisa lewat `about:config`
(`ui.systemUsesDarkTheme`).

### 4.2 Konsekuensi: konfigurasi token lewat CSS variable

Karena entry memakai `@use` (bukan `@forward`), `$wui-*` **tidak** terekspos ke aplikasi konsumen.
Artinya `@use '@wajek/wui/scss/wui.scss' with ($wui-light-primary: …)` **tidak bisa** dipakai.

Pertukaran ini sadar: pola jadi sederhana dan gampang dicopot, tapi penggantian nilai dilakukan
runtime lewat CSS variable di `src/styles.scss` aplikasi:

```scss
@use '@wajek/wui/scss/wui.scss';

:root {
  --wui-color-primary: #0057ff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --wui-color-primary: #8ab4ff;
  }
}
```

Kalau nanti butuh konfigurasi saat compile, cukup tambah satu baris `@forward 'abstracts';` di `wui.scss`.

---

## 5. Pola wajib untuk SETIAP komponen di project `wui`

Polanya sederhana: **setiap komponen punya satu file di `scss/components/` yang berisi mixin**, dan mixin
itu dipanggil di `wui.scss`.

```
projects/wui/scss/components/_<nama>.scss     ← MURNI @mixin (tidak ada selector di luar mixin)
projects/wui/scss/components/_index.scss      ← @forward '<nama>';
projects/wui/scss/wui.scss                    ← @include components.<nama>;
```

Karena style-nya di-emit dari `wui.scss` (global, tanpa view encapsulation), style komponen berlaku di
mana pun — termasuk konten yang datang dari komponen lain (kasus `.wui-page-layer`). Ini sekaligus
menghilangkan masalah encapsulation yang sebelumnya memaksa aturan khusus.

**Yang harus dibayar:** style komponen baru muncul kalau aplikasi memuat style layer
(`@use '@wajek/wui/scss/wui.scss'` di `src/styles.scss`). Kalau lupa, komponen tampil polos — ini sudah
jadi kontrak proyek ini, bukan hal baru.

### Contoh: komponen `WuiButton`

`scss/components/_button.scss` — semua selector ditulis **di dalam** mixin:

```scss
@use '../abstracts' as a;

/// Style tombol. Baru keluar kalau dipanggil dari `wui.scss`.
@mixin button {
  .wui-button {
    display: inline-flex;
    gap: a.$wui-space-2;
    padding: a.$wui-space-2 a.$wui-space-4;
    border-radius: var(--wui-radius-md);
    background: var(--wui-color-primary);
    color: var(--wui-color-text);
    transition: background-color var(--wui-motion-duration-fast) var(--wui-motion-easing-standard);

    &.is-loading {
      opacity: 0.6;
      pointer-events: none;
    }
  }
}
```

`scss/components/_index.scss` — merangkum semua partial di folder itu:

```scss
@forward 'app-shell';
@forward 'button';
@forward 'card';
```

`scss/wui.scss` — satu baris per komponen:

```scss
@include components.app-shell;
@include components.button;
```

### Kapan boleh keluar dari pola

| Situasi | Cara |
| --- | --- |
| Style normal (default) | Mixin di `_<nama>.scss` + `@include` di `wui.scss` |
| Butuh aturan `:host` / `::ng-deep` yang hanya berlaku di komponen itu | Boleh ditulis di component SCSS (`src/<nama>/<nama>.scss`); aturan lainnya tetap di mixin |
| App mau menambah varian sendiri (`<button class="wui-button wui-button--lg">`) | Cukup tambah varian di mixin yang sama — tidak perlu file baru |

### Checklist setiap kali membuat komponen baru di `wui`

1. [ ] Buat `scss/components/_<nama>.scss` berisi mixin bernama `<nama>()`.
2. [ ] Semua selector ditulis **di dalam** mixin, ber-prefix `wui-`.
3. [ ] Daftarkan di `scss/components/_index.scss` (`@forward '<nama>';`).
4. [ ] Panggil di `wui.scss` (`@include components.<nama>;`).
5. [ ] Tidak ada nilai mentah — warna/jarak/durasi lewat `var(--wui-*)` atau token `abstracts`.
6. [ ] `npm run lint:styles` hijau, `ng build wui` hijau.

> Butir 1–5 masih dijaga lewat review. Kandidat penegakan otomatis ada di §9.

---

## 6. Konvensi penamaan

| Objek | Pola | Contoh |
| --- | --- | --- |
| Folder level | kebab-case, tanpa prefix `_` | `abstracts/`, `base/`, `themes/`, `components/` |
| File partial internal | `_kebab-case.scss` + `_index.scss` per folder | `_light-theme.scss`, `_app-shell.scss` |
| Entry | tanpa prefix `_` | `wui.scss` |
| SCSS variable | `$wui-<kategori>-<nama>` + `!default` | `$wui-color-primary`, `$wui-space-4` |
| CSS custom property | `--wui-<kategori>-<nama>` | `--wui-color-primary` |
| Mixin | `@mixin <komponen>()` di file komponennya; `@mixin <fungsi>()` di `_mixins.scss` | `button()`, `focus-ring()` |
| Fungsi | `@function <nama>()` | `spacing($n)`, `alpha($color, $amount)` |
| Class | `wui-<komponen>[__<elemen>][--<varian>]` | `.wui-button`, `.wui-button__icon`, `.wui-button--lg` |
| State | `.is-*` | `.is-loading` |

---

## 7. Peta migrasi dari kondisi sekarang

| File sekarang | Nasib |
| --- | --- |
| `scss/tokens/_z-index.scss` | → digabung ke `scss/abstracts/_tokens.scss` |
| `scss/tokens/_motion.scss` | → digabung ke `scss/abstracts/_tokens.scss` |
| `scss/tokens/_overlay.scss` | → digabung ke `scss/abstracts/_tokens.scss` |
| `scss/tokens/_index.scss` | → **dibubarkan**; `@mixin css-vars()` pindah ke `themes/` (dipecah per tema) |
| `scss/components/_app-shell.scss` | → tetap di `components/`, tapi yang meng-emit wajib diberi komentar eksplisit + di-review ulang |
| `scss/components/_index.scss` | → tetap, tinggal tambah `@forward` komponen baru |
| `scss/wui.scss` | → jadi file pemanggil `@use` + `@include` sesuai §4 (bukan lagi `@forward` + `css-vars()`) |
| `scss/app.scss` (kosong, tidak terpakai) | → **dihapus** (sempat bikin `lint:styles` gagal `no-empty-source`) |

**Urutan migrasi yang aman** (tiap langkah harus tetap bisa `ng build wui` + `ng build`):

1. Buat `abstracts/` (pindahkan isi `tokens/`, tambah `_functions.scss` & `_mixins.scss` kosong-berisi-aturan).
2. Buat `themes/` (`light-theme` meng-emit `:root` dari token; `dark-theme` meng-emit override).
3. Buat `base/` (awalnya reset minimal dulu — lihat keputusan §10).
4. Susun ulang `wui.scss` jadi daftar `@use` + `@include` per layer sesuai §4, lalu hapus `tokens/`.
5. Rapikan `components/_app-shell.scss` mengikuti aturan §5 dan tambahkan 1 komponen contoh (`_button.scss` + komponen `WuiButton`) sebagai acuan pola.
6. Perbarui `.stylelintrc.json` dan dokumentasi.

**Risiko migrasi yang perlu dijaga:**

- Kalau baris `@include themes.light-theme;` / `@include themes.dark-theme;` lupa dipasang di `wui.scss`,
  tidak ada `--wui-*` yang ter-emit → komponen tampil tanpa warna **tanpa error apa pun**.
  Verifikasi dengan `cat www/styles.css`.
- Urutan `@include` terbalik (`components` sebelum `themes`) → `var(--wui-*)` kosong, lagi-lagi tanpa error.
  Karena itu urutannya dibekukan di §4.
- Karena entry memakai `@use` (bukan `@forward`), `$wui-*` tidak terekspos ke konsumen. Penggantian nilai
  hanya lewat CSS variable. Kalau nanti perlu compile-time config, tambah `@forward 'abstracts';`.
- Pindahnya emisi dari `abstracts` ke `themes/` berarti jumlah CSS variable yang keluar harus dicek ulang
  terhadap baseline: bandingkan `www/styles.css` sebelum vs sesudah migrasi.

---

## 8. Dampak ke dokumen lain

| Dokumen | Dampak |
| --- | --- |
| `docs/planning/scss-wui-plan.md` §3 (struktur folder) | **Digantikan** oleh dokumen ini → sudah ditandai di file aslinya. Level `tools/`, `layout/`, `utilities/` tidak dipakai |
| `scss-wui-plan.md` §6.1/§6.3 (assets, includePaths) | Tidak berubah — kontrak `scss/wui.scss` tetap sama |
| `wui-app-page-stack-plan.md` §5 (token) | Dipindahkan: token sekarang di `abstracts/`, emisi di `themes/` |
| `.stylelintrc.json` | Perlu aturan tambahan supaya folder `abstracts/` tetap bebas output (§9) |

---

## 9. Penegakan aturan (opsional tapi disarankan)

`.stylelintrc.json` bisa ditambah aturan yang menegakkan struktur:

```jsonc
{
  "overrides": [
    {
      "files": ["projects/wui/scss/abstracts/**/*.scss"],
      "rules": {
        // abstracts tidak boleh punya selector → tidak boleh ada output
        "selector-max-type": [0, { "message": "abstracts/ hanya boleh $variable, @function, @mixin." }],
        "no-duplicate-selectors": true
      }
    },
    {
      "files": ["projects/wui/scss/components/_*.scss"],
      "rules": {
        // partial komponen tidak boleh punya selector tingkat teratas (harus di dalam mixin)
        "max-nesting-depth": 4
      }
    }
  ]
}
```

Kalau aturan di atas ternyata tidak cukup (stylelint tidak bisa mendeteksi "keluaran CSS"), penegakan
realistisnya: checklist §5 + review, ditambah satu unit test kecil yang meng-compile `scss/wui.scss`
dan memastikan `abstracts/` tidak menyumbang selector apa pun.

---

## 10. Keputusan terbuka

1. ~~**Level `layout/` & `utilities/`**~~ → **tidak dipakai** ✅ (S6), ditunda sampai ada kebutuhan nyata.
2. **Reset** — `base/_reset.scss` versi minimal saja, atau normalize penuh? (Ini mengubah tampilan
   aplikasi konsumen secara nyata.)
3. ~~**Nama tema**~~ → otomatis lewat **`prefers-color-scheme`** ✅ (S8). Tanpa atribut/class. Kalau nanti
   butuh toggle manual dari dalam aplikasi, override-nya ditambahkan di atas media query.
4. **Brand theme** — nama file tema tambahan (`_brand-theme.scss`) perlu sejak awal atau nanti?
5. ~~**Emisi class global**~~ → sudah terjawab oleh pola S7: selector seperti `.wui-button` ditulis **di dalam**
   `@mixin button` dan di-emit dari `wui.scss` ✅. Tidak perlu `@mixin classes()` terpisah.
6. **Rename komponen shell** — `src/app/app.*` → `src/wui-app/wui-app.*` supaya selaras pola
   `src/<nama>/<nama>.scss`? (Sebelumnya sudah jadi keputusan terbuka di dokumen lain.)
7. **Hapus `src/lib/wui.ts`** — scaffold lama yang masih diekspor di `public-api.ts`.
8. ~~**Token publik**~~ → mengikuti pola sederhana, `abstracts` cukup di-`@use` ✅. Konsekuensinya `$wui-*`
   tidak bisa dikonfigurasi lewat `with (...)`; penggantian nilai lewat CSS variable (§4.2).

---

## 11. Roadmap fase

### S0 — Persiapan (0.5 hari)
- [ ] Kunci keputusan §10 (minimal 1, 2, 3)
- [ ] Hapus `scss/app.scss` yang kosong
- [ ] Catat baseline: simpan isi `www/styles.css` sekarang untuk pembanding

**DoD:** daftar keputusan tertulis, baseline CSS tersimpan.

### S1 — `abstracts/` ✅ selesai
- [x] `_tokens.scss` — token lama (z-index, motion, overlay, radius) + 6 warna (`$wui-light-*`/`$wui-dark-*`)
      + skala spasi
- [x] `_mixins.scss` — `media-up()`, `focus-ring()`
- [x] `_functions.scss` — `spacing()`, `alpha()`
- [x] `_index.scss` (`@forward` ketiganya)
- [x] `scss/tokens/` dihapus

**DoD tercapai:** `ng build wui` hijau, dan `abstracts/` tidak menyumbang selector apa pun — terbukti
karena semua blok CSS di `www/styles.css` bisa ditelusuri ke layer lain.

### S2 — `themes/` ✅ selesai
- [x] `_light-theme.scss` → `@mixin light-theme`: `:root { color-scheme: light; --wui-* }`
- [x] `_dark-theme.scss` → `@mixin dark-theme`: `@media (prefers-color-scheme: dark) { :root { … } }`
- [x] `_index.scss`
- [x] 3 CSS variable warna + token non-warna (spasi, radius, z-index, motion, overlay)

**DoD tercapai:** `www/styles.css` memuat blok `:root` (dengan `--wui-color-background: #fff`) dan blok
`@media (prefers-color-scheme: dark)` (dengan `--wui-color-background: #121212`).

### S3 — `base/` ✅ selesai (reset versi MINIMAL)
- [x] `_reset.scss` → `@mixin reset`: hanya `box-sizing: border-box` + `body { margin: 0 }`
- [x] `_typography.scss` → `@mixin typography`: font dasar di `:root`, warna tema di `body`

> **Revisi 17 Sep 2026 — ukuran teks bawaan dokumen.** `body` kini menerapkan peran **body/medium**
> (`--wui-font-size-body-medium`, `0.875rem` = 14px pada root 16px). Ditaruh di `body`, bukan di
> `:root`, karena `font-size` di `:root` mengubah arti `rem` untuk seluruh dokumen sehingga semua
> token spacing & skala tipografi ikut menyusut 12,5% — yang diinginkan hanya ukuran teks bawaan.
> Konsekuensi yang terukur: elemen yang **mewarisi** ukuran (mis. `.wui-input` yang memakai
> `font: inherit`) sekarang 14px/21px, sedangkan yang memakai token peran (label field 16px, tombol
> 14px, hint 12px, judul 28px) tidak berubah. `html` tetap 16px sehingga `1rem` tetap 16px.

> Keputusan §10 no. 2 diambil: **minimal dulu**. Kalau nanti ingin lebih agresif (normalize penuh),
> cukup ganti isi `@mixin reset` — `wui.scss` tidak perlu diubah.

### S4 — `components/` ⏳ sebagian
- [x] `_app-shell.scss` diubah jadi `@mixin app-shell` mengikuti pola §5
- [x] `_index.scss` merangkum partial di folder itu
- [ ] Belum ada komponen kedua — contoh `_button.scss` + `WuiButton` menyusul saat komponennya dibuat

### S5 — `wui.scss` final + dokumentasi (sebagian)
- [x] Entry berisi `@use` + daftar `@include` per layer sesuai §4 (satu baris = satu layer)
- [x] `npm run lint:styles` hijau
- [x] §3 di `scss-wui-plan.md` ditandai digantikan dokumen ini
- [ ] README: struktur, aturan level, checklist komponen

### Status verifikasi (2026-09-16, container `wui_angular_dev`)

```
npm run lint:styles                   → hijau
ng build wui                          → ✔ dist/@wajek/wui
ng build --configuration development  → ✔ styles.css 1.29 kB
```

Isi `www/styles.css` berurutan sesuai layer:

```
* { box-sizing } · body { margin: 0 }                              ← base/reset
:root { font-family … } · body { background/color }                 ← base/typography
:root { color-scheme: light; --wui-color-*; --wui-space-*; … }      ← themes/light-theme
@media (prefers-color-scheme: dark) { :root { --wui-color-* } }     ← themes/dark-theme
.wui-app__overlay-host · .wui-page-layer                            ← components/app-shell
```

---

## 12. Cara verifikasi

```bash
# di container wui_angular_dev
npm run lint:styles
npx ng build wui
npx ng build --configuration development
cat www/styles.css          # cek :root, blok dark, dan tidak ada selector dari abstracts/
```

Yang dibuktikan tiap kali: (a) tidak ada style yang hilang setelah restrukturisasi, (b) tidak ada
selector dari `abstracts/`, (c) urutan layer di CSS hasil build benar
(abstracts → base → themes → components).

---

## 13. Deliverable akhir

1. `scss/` tersusun 4 level dengan entry `wui.scss` yang isinya hanya `@include` mixin tiap layer —
   mencopot sebuah layer = menghapus satu baris.
2. `abstracts/` benar-benar bebas output; `themes/` yang meng-emit `--wui-*` untuk mode terang dan gelap
   (`prefers-color-scheme`) dengan 3 warna: background, text, primary.
3. **Satu pola komponen yang terdokumentasi dan diterapkan** ke semua komponen `wui`
   (partial berisi mixin + dipanggil dari `wui.scss`).
4. Checklist komponen di README supaya penambahan komponen baru konsisten.
5. `lint:styles` hijau dan CSS hasil build setara (atau lebih rapi) dibanding baseline.
