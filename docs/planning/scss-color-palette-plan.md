# Planning — Sistem Palet Warna `@wajek/wui`

> Tujuan: aplikasi cukup **memilih satu nama palet** (`blue`, `purple`, `green`, `yellow`, …)
> lalu seluruh token semantik (`--wui-color-primary`, dst.) otomatis mengikuti palet itu,
> tanpa menyentuh token satu per satu dan tanpa mengubah file komponen.

Status: **F0 & F1 selesai** (palet sudah bisa dipilih dari sisi aplikasi) — F2 (API palet custom) siap dikerjakan.
Dokumen terkait: `docs/planning/scss-structure-plan.md` (5 level: abstracts → base → themes → components → utilities),
`docs/planning/scss-wui-plan.md` (kontrak distribusi & konsumsi).

---

## 0. Jawaban singkat

**Bisa.** Bentuk yang paling dekat dengan keinginan Anda:

```scss
// src/styles.scss — cukup satu baris, tidak perlu @include apa pun
@use '@wajek/wui/scss/wui.scss' with ($wui-palette: 'green');
```

Hasilnya di `styles.css`: `--wui-color-primary: var(--wui-color-green-500)`, dan nilai
`--wui-color-green-500` sudah otomatis berbeda antara mode terang & gelap
(`:root` = tone light, `@media (prefers-color-scheme: dark)` = tone dark).

Dua catatan penting yang membentuk seluruh planning ini:

1. **Ini compile-time.** Mengganti nama palet butuh build ulang (menyentuh Sass variable).
   Mekanisme ganti palet **saat runtime** (theme picker) memang bisa — atribut `data-palette` + semua
   palet di-emit — tapi **ditunda** dan belum perlu untuk sekarang (C10, §4 Opsi C).
2. **Tidak bisa** dengan cara `$wui-palette: purple;` ditulis di atas `@use` — variable lokal
   milik file konsumen tidak "merembes" ke library. Mekanisme sahnya hanya `@use … with (…)`
   (deklaratif) atau `@include` sebuah mixin (imperatif).

Palet **milik aplikasi** (warna brand sendiri, bukan bawaan library) juga bisa dipasang dari sisi
aplikasi tanpa mengubah library — dua bentuknya ada di §5.

---

## 1. Kondisi sekarang (hasil pemeriksaan di container)

Yang **sudah** ada dan jalan:

| Bagian | Isi | Status |
| --- | --- | --- |
| `abstracts/_tokens.scss` | `$wui-color-palettes: ('purple': (light: (50…950), dark: (50…950)))` | ✅ data siap multi-palet (akan dipisah jadi `$wui-palettes-builtin` + `$wui-palettes-extra` → `$wui-palettes`, C15) |
| `themes/_palette.scss` | `@mixin palette($name)` — emit `--wui-color-<nama>-<tone>` (mode-aware) + `-light-`/`-dark-` eksplisit; `@mixin all-palettes` | ✅ jalan |
| `abstracts/_functions.scss` | `color($name, $tone, $mode)` → `var(--wui-color-…)`, `color-raw(...)` → hex compile-time | ✅ jalan |
| `src/styles.scss` | `@include wui.palette('purple');` | ✅ opt-in manual |
| `themes/_index.scss` | `@forward 'palette'` | ✅ |
| `wui.scss` | `@forward 'themes';` | ⚠️ ada, tapi **setelah** `@use 'themes';` — urutan ini membuat `with()` gagal keras (terbukti di F0, lihat §10) |

Bukti dari build aplikasi (`www/styles.css`):

```
--wui-color-primary: var(--wui-color-purple-light-500)   /* :root */
--wui-color-primary: var(--wui-color-purple-dark-500)    /* @media prefers-color-scheme: dark */
--wui-color-purple-50 … --wui-color-purple-950           /* mode-aware, ikut berubah per mode */
--wui-color-purple-dark-50 … -950                        /* eksplisit */
```

Yang **belum** mendukung keinginan Anda:

| Masalah | Akibat |
| --- | --- |
| `$wui-light-primary: var(--wui-color-purple-light-500)` menulis nama `purple` **hardcode di tokens** | Ganti palet = harus edit `tokens` (bukan pilihan aplikasi) |
| `$wui-dark-primary: var(--wui-color-purple-dark-500)` sama | idem |
| Mounting palet masih manual (`@include wui.palette('purple')`) | Lupa meng-include = `--wui-color-primary` menunjuk variable yang **tidak terdefinisi** → tombol/ikon jadi transparan |
| Belum ada variable konfigurasi palet | Tidak ada titik pilih tunggal |
| `-dark-` di-emit **dua kali** (`:root` dan di dalam media query) | CSS redundant, tidak fatal |
| Belum ada penjagaan nama palet | `'primary'` sebagai nama palet bisa bentrok dengan token semantik |
| Palet `purple` belum punya kunci `'on-primary'` | C17 butuh nilai per mode; sementara diisi placeholder |

---

## 2. Konsep: tiga lapis

```
[1] SKALA (data)            [2] PEMILIHAN (config)         [3] SEMANTIK (kontrak komponen)
$wui-palettes-builtin  →    $wui-palette: 'green'     →    --wui-color-primary
 + $wui-palettes-extra      themes/_palette.scss           --wui-color-on-primary
purple/light/500 = hex      themes/_light-theme.scss       --wui-color-state-layer-primary-opacity-08
green/dark/500  = hex                                      →  komponen TIDAK pernah tahu
                                                              nama paletnya
```

- **Lapis 1** hanya data hex. Semua development/pengembangan palet terjadi di sini.
- **Lapis 2** menerjemahkan pilihan jadi CSS custom property. Ini satu-satunya tempat nama palet boleh muncul.
- **Lapis 3** adalah kontrak yang dibaca komponen (`var(--wui-color-primary)`). Karena komponen cuma tahu lapis 3,
  mengganti palet **tidak menyentuh satu pun file komponen**.

Kalau prinsip ini dijaga, pertanyaan Anda ("cukup definisikan palette = purple") otomatis terjawab:
`tokens` tidak boleh mengimpor nama palet apa pun (lihat C7).

### 2.1 Lapis 3 — peran semantik & state layers (C5 ✅)

Peran yang di-drive palet (dipilih **lengkap**, dua peran):

| Peran | Token | Sumber nilai |
| --- | --- | --- |
| primary | `--wui-color-primary` | tone 500 palet aktif (mode-aware) |
| on-primary | `--wui-color-on-primary` | data palet per mode — kunci `'on-primary'` (C17): warna teks/ikon di atas primary |

Untuk palet bawaan `purple`, nilai `'on-primary'` diisi **placeholder** dulu — `#ffffff` (light) dan
`#05000f` (dark) — supaya F1 bisa jalan; nilai final menunggu Figma.

**State layers** diturunkan dari peran di atas, bukan data hex terpisah:

| Peran | Token | Nilai |
| --- | --- | --- |
| primary | `--wui-color-state-layer-primary-opacity-08` / `-10` / `-16` | `color-mix(in srgb, var(--wui-color-primary) 8%, transparent)` |
| on-primary | `--wui-color-state-layer-on-primary-opacity-08` / `-10` / `-16` | `color-mix(in srgb, var(--wui-color-on-primary) 8%, transparent)` |

- Pemetaan dari Figma: `light/state-layers/primary/opacity-08` → `--wui-color-state-layer-primary-opacity-08`.
  Mode tidak ditulis di nama token karena `--wui-color-primary` sudah otomatis berubah per mode.
- Karena turunan, definisinya cukup **sekali** (di `:root`) — tidak diulang di blok dark, dan palet custom
  aplikasi otomatis ikut benar tanpa mengisi data tambahan.
- Daftar opacity diatur lewat `$wui-state-layer-opacities` (C18 ✅); nilai final
  `('08': 0.08, '10': 0.10, '16': 0.16)`.
- **Penting**: kunci map harus **string** (`'08'`). Kalau ditulis angka `08`, Sass membacanya sebagai `8`
  sehingga token jadi `opacity-8` (sudah diuji di container).
- Komponen memakainya lewat fungsi `state-layer($role, $opacity)` → `var(--wui-color-state-layer-primary-opacity-08)`,
  supaya nama token tidak ditulis manual di banyak file.

Pemetaan opacity → state interaksi (satu-satunya tempat pemetaan ini hidup):

| Token | Opacity | Dipakai untuk |
| --- | --- | --- |
| `…-opacity-08` | `0.08` | hover |
| `…-opacity-10` | `0.10` | pressed |
| `…-opacity-16` | `0.16` | dragged |

Nama token tetap berbasis opacity (bukan nama state) supaya sejajar dengan Figma; pemetaan ke
hover/pressed/dragged nanti dipakai mixin interaksi tingkat komponen agar tidak ditulis ulang di
tiap komponen.

---

## 3. Keputusan yang perlu dikunci

| # | Keputusan | Rekomendasi saya |
| --- | --- | --- |
| C1 | Mekanisme pemilihan palet | ✅ **dipilih: Opsi A** (deklaratif `@use … with`). Mixin `palette()` tetap ada sebagai implementasi internal sekaligus jalur cadangan (Opsi B) |
| C2 | Nama variable konfigurasi | `$wui-palette` (nilai string nama palet), `!default: 'purple'` |
| C3 | Tone yang di-emit | ✅ Hanya **palet aktif** (konsekuensi C10: tanpa runtime switch), seluruh tone-nya (11). `$wui-palette-tones` tetap disediakan bila CSS ingin disempitkan |
| C4 | Varian eksplisit `-light-` / `-dark-` | **Pertahankan** (berguna untuk latar lembut lintas mode), tapi hapus emisi ganda `-dark-` di dalam media query |
| C5 | Peran semantik yang di-drive palet | ✅ **dipilih lengkap**: `primary` + `on-primary`, dan **masing-masing punya state layers** (`opacity-08/10/16` = hover/pressed/dragged) — §2.1 |
| C6 | `--wui-color-primary` cukup ditulis di `_light-theme.scss` pakai var mode-aware | **Ya** — hapus duplikasinya dari `_dark-theme.scss` (`--wui-color-<palet>-<tone>` sudah otomatis berubah di mode gelap) |
| C7 | `$wui-light-primary` & `$wui-dark-primary` dihapus dari `tokens` | **Ya** — hanya dipakai di dua file themes, jadi aman; digantikan `color($wui-palette, 500)` |
| C8 | Palet default di-include otomatis oleh `wui.scss` | **Ya** — supaya "lupa include" tidak menghasilkan warna transparan |
| C9 | Normalisasi nama palet | Terima `purple` maupun `'purple'`; tolak nama yang bentrok token semantik (`primary`, `background`, `text`, `outline`, `overlay`) dengan `@error` |
| C10 | Runtime switch (`data-palette`) | ✅ **belum perlu** — ditunda tanpa fase. Mixin `all-palettes` tetap ada sebagai alat manual bila nanti dibutuhkan |
| C11 | API tambah palet custom dari aplikasi | **Ya**: (a) **jalur utama** deklaratif `$wui-palettes-extra`, (b) imperatif `@include a.palette('brand', $tones)` sebagai cadangan (§5) |
| C12 | `$wui-palettes-extra` di `tokens` + `@forward 'abstracts';` di baris pertama `wui.scss` | **Ya** — sudah dibuktikan jalan di spike F0b; urutan salah = build gagal keras, bukan warna salah diam-diam |
| C13 | `$wui-palette: false` = jangan apply otomatis | **Ya** — untuk aplikasi yang ingin memanggil `palette()` sendiri, supaya skala palet bawaan tidak ikut ter-emit. (`null` **tidak bisa**: `!default` menganggap `null` sebagai belum diisi — terbukti di F1) |
| C14 | ~~Palet dari satu warna brand (`$base-color:`)~~ | ❌ **dibatalkan** — C16: palet selalu lengkap dari desainer, generator tone tidak diperlukan |
| C15 | Penamaan peta palet | `$wui-palettes-builtin` (data library), `$wui-palettes-extra` (diisi aplikasi), `$wui-palettes` (hasil merge, dipakai `palette()`/`color()`). Nama lama `$wui-color-palettes` → `$wui-palettes-builtin` |
| C16 | Bentuk palet aplikasi | ✅ **selalu lengkap** — semua tone (50–950) × 2 mode, tanpa warisan tone/`'base'`; library hanya **memvalidasi** kelengkapan (§5.3) |
| C17 | Sumber & bentuk `on-primary` | ✅ **data palet per mode** — kunci `'on-primary'` menempel di dalam `light`/`dark` (bukan dihitung otomatis, bukan blok terpisah) |
| C18 | Daftar opacity state layer | ✅ `$wui-state-layer-opacities: ('08': 0.08, '10': 0.10, '16': 0.16)` — hover / pressed / dragged |
| C19 | Cara menghitung state layer | **Di CSS** memakai `color-mix(in srgb, …, transparent)`, bukan alpha compile-time — cukup satu definisi, otomatis ikut mode & palet aktif |

---

## 4. Opsi mekanisme pemilihan palet

### Opsi A — deklaratif via `@use … with` ✅ direkomendasikan

```scss
// src/styles.scss
@use '@wajek/wui/scss/wui.scss' with ($wui-palette: 'green');
```

Syarat teknisnya (semuanya bisa dipenuhi):

1. `$wui-palette: 'purple' !default;` harus ada di modul yang **di-`@forward`** oleh `wui.scss`
   → letakkan di `themes/_palette.scss`, karena `themes/_index.scss` sudah `@forward 'palette'`.
2. `wui.scss` harus meng-`@forward 'themes'` **sebelum** `@use 'themes'` (configuration hanya
   merembes lewat `@forward`, bukan lewat `@use`) → **sudah dibuktikan di F0**: urutan benar = jalan,
   urutan terbalik = build gagal dengan error yang jelas (bukan warna salah diam-diam).
3. `wui.scss` otomatis memakai palet terpilih: `@include themes.palette(themes.$wui-palette);`.

Kelebihan: satu baris, palet jadi bagian dari konfigurasi build, kelihatan jelas di git diff.
Batasan: `with()` hanya boleh pada **pemuatan pertama** modul itu. Di Angular setiap component SCSS
dikompilasi sebagai unit terpisah, jadi praktis tidak ada konflik — tapi kalau suatu saat `wui.scss`
juga di-`@use` dari file lain dalam graf yang sama, aturannya berlaku.

### Opsi B — imperatif via `@include` (sudah jalan sekarang)

```scss
@use '@wajek/wui/scss/wui.scss' as wui;

@include wui.palette('green');   // emit skala + arahkan token semantik ke palet ini
```

Perubahan yang diusulkan: mixin `palette($name)` sekarang **hanya** meng-emit skala, jadi pemanggil
masih harus memastikan `--wui-color-primary` mengarah ke sana. Kalau `palette()` sekaligus mengisi
pemetaan semantik, satu panggilan = selesai.

Kelebihan: bebas urutan `@forward`/`@use`, bisa dipanggil kapan pun, bisa dipanggil **lebih dari sekali**
berguna nanti untuk runtime switch. Kekurangan: tidak "deklaratif" — palet bukan bagian config.

> **Rekomendasi:** implementasi Opsi B lebih dulu (langsung bisa dipakai, tanpa risiko urutan),
> lalu buka Opsi A di atasnya dengan `$wui-palette` — keduanya memanggil satu fungsi internal yang sama
> sehingga tidak ada dua logika yang bisa berbeda.

### Opsi C — runtime via atribut (⏸ ditunda, C10)

```scss
// styles.scss
@use '@wajek/wui/scss/wui.scss' as wui;

@include wui.all-palettes;          // emit skala + pemetaan semantik semua palet
```

```html
<body data-palette="green">
```

Menghasilkan `[data-palette='green'] { --wui-color-primary: var(--wui-color-green-500); … }`,
jadi ganti palet **tanpa rebuild** (cocok untuk theme picker). Biaya: semua palet di CSS
(≈ 33 variable × jumlah palet) — masih wajar, tapi harus sadar biayanya.

### Opsi D — escape hatch (sudah selalu tersedia)

```scss
:root { --wui-color-primary: #12b981; }
```

Tidak perlu direncanakan; cukup didokumentasikan sebagai jalan terakhir kalau palet resmi belum ada.

---

## 5. API palet custom (aplikasi punya warna sendiri)

Aplikasi boleh menambah palet di luar yang dikirim library, **tanpa mengubah file library**. Kedua
bentuk di bawah memanggil satu fungsi resolusi yang sama di `themes/_palette.scss`:

```scss
@mixin palette($name, $tones: null, $activate: true) { … }
```

- `$tones: null` → ambil dari `$wui-palettes` (perilaku sekarang).
- `$tones` wajib berbentuk `('light': (…), 'dark': (…))` dan **lengkap** (C16) — tidak ada warisan
  tone dari palet bawaan.
- `$activate: false` → hanya meng-emit skala (untuk dipakai `color('brand', 600)` di SCSS aplikasi),
  tanpa menggeser `--wui-color-primary`.
- Contoh di bawah dipersingkat (2–3 tone); pada praktiknya selalu **11 tone per mode**.

### 5.1 Deklaratif — ikut `with()`, tanpa `@include` (sejalur Opsi A)

```scss
// src/styles.scss
@use '@wajek/wui/scss/wui.scss' with (
  $wui-palette: 'brand',
  $wui-palettes-extra: (
    'brand': (
      'light': (500: #7c3aed, 600: #6d28d9, 700: #5b21b6),
      'dark': (500: #c4b5fd, 600: #ddd6fe, 700: #ede9fe),
    ),
  ),
);
```

`tokens` menggabungkan data bawaan + extra:

```scss
$wui-palettes-builtin: ('purple': (…)) !default;
$wui-palettes-extra: () !default;                                     // diisi aplikasi
$wui-palettes: map.merge($wui-palettes-builtin, $wui-palettes-extra) !default;
```

Karena extra di-merge **paling akhir**, aplikasi juga bisa menimpa tone palet bawaan (mis. meretur
`purple`) tanpa menyentuh library. `$wui-palettes` adalah map final yang dipakai `palette('brand')`,
fungsi `color('brand', 500)`, dan `all-palettes`. **Sudah diuji (spike F0b)**: konfigurasi sampai ke
`tokens` → `--brand-light-500: #7c3aed` ✓.

Syaratnya: `wui.scss` harus `@forward 'abstracts';` di baris **paling atas**, sebelum apa pun yang
memuat `tokens`. Urutan salah = build gagal (`This module was already loaded…`).

### 5.2 Imperatif — satu mixin, bebas urutan

```scss
@use '@wajek/wui/scss/wui.scss' as wui;

@include wui.palette('brand', (
  'light': (500: #7c3aed, 600: #6d28d9),
  'dark': (500: #c4b5fd, 600: #ddd6fe),
));
```

Kalau `$wui-palette` dibiarkan default (`'purple'`), blok `:root` aplikasi tetap menang karena ditulis
paling akhir pada spesifisitas yang sama. Supaya tidak ada CSS mati, set `$wui-palette: false` (C13)
lalu cukup panggil mixin ini.

### 5.3 Validasi: palet custom wajib lengkap (C16)

Karena palet aplikasi selalu datang lengkap dari desainer, tidak ada fitur warisan tone. Yang
dikerjakan library adalah **memvalidasi**, supaya kekurangan tone atau typo ketahuan saat build:

- Kunci `'light'` dan `'dark'` wajib ada → kalau salah satu tidak ada: `@error`.
- Setiap tone yang dipakai peran semantik (mis. 500) wajib ada di **kedua** mode → kalau tidak:
  `@error` menyebut nama palet, mode, dan tone yang hilang.

Konsekuensinya, generator tone dari satu warna (`$base-color`, C14) tidak direncanakan.

---

## 6. Perubahan file (target akhir)

| File | Perubahan |
| --- | --- |
| `abstracts/_tokens.scss` | Hapus `$wui-light-primary` & `$wui-dark-primary` (C7). Peta: `$wui-palettes-builtin` + `$wui-palettes-extra` + `$wui-palettes`, `$wui-palette-required-tones`, `$wui-state-layer-roles`, `$wui-state-layer-opacities`, kunci `'on-primary'` pada palet `purple` (C12, C15, C17, C18) |
| `abstracts/_index.scss` | `@forward 'tokens';` **paling awal** — syarat agar konfigurasi dari aplikasi sampai (lihat §10) |
| `abstracts/_mixins.scss` | `interactive-state($role)` — state layer hover/pressed/dragged (F3) |
| `abstracts/_functions.scss` | `state-layer($role, $opacity)` (F3); `color-raw()` membaca `$wui-palettes` |
| `themes/_palette.scss` | `$wui-palette: 'purple' !default;` (`false` = jangan auto-apply, C13) + `palette-key()` / `palette-tones()` + `palette($name, $tones: null, $activate: true)`. Meng-emit skala **dan** peran semantik (`--wui-color-primary`; nanti `on-primary` + state layers) di blok `@if $wui-activate` |
| `themes/_light-theme.scss` | Hanya warna netral (`background`/`text`/`outline`). `--wui-color-primary` **tidak di sini** — di-emit `_palette.scss` karena nilainya ikut palet aktif |
| `themes/_dark-theme.scss` | Hanya warna netral mode gelap. `--wui-color-primary` tidak di-override: token palet yang dipakai sudah mode-aware |
| `scss/wui.scss` | Baris pertama `@forward 'abstracts';` (C12), lalu `@forward 'themes';` **sebelum** `@use 'themes';`, plus `@include themes.palette(themes.$wui-palette);` (C8 — tidak melakukan apa pun bila `$wui-palette: false`) |
| `src/styles.scss` (playground) | Jadi `@use '@wajek/wui/scss/wui.scss' with ($wui-palette: 'purple');` — bukti nyata Opsi A, plus satu halaman demo palet custom (§5.1) |
| `projects/wui/README.md` | Bagian "Palet warna": daftar palet, cara pilih, **cara menambah palet aplikasi (§5)**, cara menambah palet baru di library |

---

## 7. Kontrak konsumen setelah selesai

```scss
// A. Palet resmi dari library (paling ringkas)
@use '@wajek/wui/scss/wui.scss' with ($wui-palette: 'green');

// B. Kalau butuh panggil mixin (mis. karena load-order / mau ganti-ganti)
@use '@wajek/wui/scss/wui.scss' as wui;
@include wui.palette('green');

// C. Palet brand sendiri, tetap satu baris konfigurasi (§5.1)
@use '@wajek/wui/scss/wui.scss' with (
  $wui-palette: 'brand',
  $wui-palettes-extra: (
    'brand': (
      'light': (500: #7c3aed, 600: #6d28d9),
      'dark': (500: #c4b5fd, 600: #ddd6fe),
    ),
  ),
);

// D. Palet brand sendiri tanpa `with()` (§5.2)
@use '@wajek/wui/scss/wui.scss' as wui with ($wui-palette: false);
@include wui.palette('brand', ('light': (500: #7c3aed), 'dark': (500: #c4b5fd)));
```

Di komponen (library maupun aplikasi) **tidak ada yang berubah**:

```scss
.foo {
  color: var(--wui-color-primary);   // tetap ini, apa pun paletnya
}
```

---

## 8. Fase kerja

| Fase | Isi | Keluaran | Status |
| --- | --- | --- | --- |
| **F0** | Spike di container: uji apakah `@use … with ($wui-palette: 'green')` benar-benar sampai ke `themes` saat `@forward` diletakkan sebelum `@use`; uji juga urutan terbalik | ✅ **selesai** — `@forward` sebelum `@use` → `--p: green` (konfigurasi sampai). Urutan terbalik → `Error: This module was already loaded, so it can't be configured using "with"` | ✅ selesai |
| **F1** | ✅ **selesai** — `_palette.scss` dirapikan (`palette-key()`/`palette-tones()`), `$wui-palette` default `purple` (`false` = nonaktif), `--wui-color-primary` pindah ke sana, token `$wui-light-primary`/`$wui-dark-primary` dihapus, `@forward 'themes'` di atas `@use 'themes'`, playground memakai `with ($wui-palette: 'purple')` | Pilih palet = 1 baris | ✅ |
| **F2** | ✅ **selesai** — peta dipisah jadi `$wui-palettes-builtin` / `$wui-palettes-extra` / `$wui-palettes`, validasi kelengkapan (`palette-mode-tones()`), `@forward 'abstracts';` + `@forward 'themes';` di `wui.scss`, `@forward 'tokens'` dipindah ke awal `abstracts/_index.scss` | Palet brand aplikasi jalan; palet tidak lengkap ditolak saat build | ✅ |
| **F3** | ✅ **selesai** — `--wui-color-on-primary` (per mode, dari data palet), `--wui-color-state-layer-<role>-opacity-<08/10/16>` (6 token via `color-mix`), fungsi `state-layer()`, mixin `interactive-state()` | Tombol/state punya lapisan warna konsisten untuk hover/pressed/dragged | ✅ |
| ~~**F4**~~ | ⏸ **ditunda** — runtime switch (`data-palette`) tidak diperlukan (C10) | `all-palettes` tetap tersedia sebagai alat manual | ⏸ |
| **F5** | Dokumentasi README (termasuk cara menambah palet aplikasi) + halaman demo palet (swatch tone & state layer — tanpa pemilih runtime, C10) | Panduan konsumen | ⬜ belum |

**Catatan hasil F1** — terverifikasi: `npm run lint:styles` hijau, `ng build wui` + `ng build --configuration development` sukses.

- `--wui-color-primary: var(--wui-color-purple-500)` — **satu** definisi untuk dua mode (C6), tanpa
  duplikasi `-light-`/`-dark-` (C4). Total 33 var palet: 11 mode-aware + 11 `-light-` + 11 `-dark-`.
- Pemilihan dari sisi aplikasi terbukti sampai ke `_palette.scss`: `with ($wui-palette: 'green')` →
  `wui: palet green tidak ada. Palet yang tersedia: purple.`
- `with ($wui-palette: false)` → tidak ada satu pun var palet yang di-emit.
- **Temuan**: `with ($wui-palette: null)` **tidak** menonaktifkan palet, karena flag `!default`
  menganggap `null` sebagai "belum diisi" → sentinel yang dipakai `false` (C13 & baris verifikasi diperbarui).

**Catatan hasil F2 & F3** — terverifikasi: lint hijau, kedua build sukses, diuji juga lewat berkas uji `sass`.

- Palet custom dari aplikasi jalan: `with ($wui-palette: 'brand', $wui-palettes-extra: (…))` →
  `--wui-color-primary: var(--wui-color-brand-500)`, `--wui-color-on-primary` ikut nilai palet aplikasi.
- Validasi kelengkapan aktif: palet tanpa tone 500 → `wui: palet brand (light) tidak punya tone 500
  yang dipakai peran semantik.`; nama terlarang → `wui: `primary` tidak boleh jadi nama palet …`.
- 6 token state layer ter-emit, contoh:
  `--wui-color-state-layer-on-primary-opacity-10: color-mix(in srgb, var(--wui-color-on-primary) 10%, transparent)`.
- `@include interactive-state()` menghasilkan `:hover` → `-opacity-08`, `:active` → `-opacity-10`,
  `.is-dragged` → `-opacity-16`; `interactive-state('on-primary')` memakai versi on-primary.
- **Temuan penting (satu tingkat lebih dalam dari F0)**: konfigurasi `$wui-palettes-extra` awalnya gagal
  — `tokens` sudah keburu dimuat tanpa konfigurasi oleh `abstracts/_functions.scss`. Solusinya:
  `@forward 'tokens';` **paling awal** di `abstracts/_index.scss` (dijelaskan sebagai komentar di file itu).

---

## 9. Verifikasi (di container, tiap fase)

```sh
docker exec -w /workspace wui_angular_dev sh -c "npm run lint:styles"
docker exec -w /workspace wui_angular_dev sh -c "npx ng build wui && npx ng build --configuration development"
docker exec -w /workspace wui_angular_dev sh -c "grep -o -- '--wui-color-primary:[^;]*' www/styles.css"
docker exec -w /workspace wui_angular_dev sh -c "grep -c -- '--wui-color-green' www/styles.css"
```

Yang harus terlihat:

| Skenario | Ekspektasi |
| --- | --- |
| `with ($wui-palette: 'green')` | `--wui-color-primary: var(--wui-color-green-500)`; `--wui-color-green-*` ter-emit |
| Tanpa konfigurasi apa pun | `--wui-color-primary: var(--wui-color-purple-500)` dan skalanya tetap ada (C8) |
| Palet tidak dikenal | build gagal dengan `@error` yang menyebut palet tersedia |
| Palet bernama `primary` | build gagal (`@error` nama terlarang) |
| Palet custom via `$wui-palettes-extra` | `--wui-color-brand-light-500` dkk ter-emit; `--wui-color-primary: var(--wui-color-brand-500)` (terbukti di F2) |
| `@include interactive-state()` | `:hover` → `-opacity-08`, `:active` → `-opacity-10`, `.is-dragged` → `-opacity-16` (terbukti di F3) |
| Nama palet tak dikenal / terlarang | `@error` menyebut palet yang tersedia atau daftar nama yang dilarang |
| `$wui-palette: false` | tidak ada `--wui-color-purple-*`; warna semantik murni dari palet aplikasi (terbukti di F1) |
| Palet custom kurang lengkap (mode atau tone peran hilang) | build gagal; `@error` menyebut palet, mode, dan tone yang hilang |
| Mode gelap | `--wui-color-primary` tetap satu definisi, nilainya berubah otomatis |
| Peran & state layer | `--wui-color-on-primary` ada di `:root` **dan** di blok dark; `--wui-color-state-layer-primary-opacity-08: color-mix(in srgb, var(--wui-color-primary) 8%, transparent)` |
| Palet custom tanpa kunci `'on-primary'` | build gagal; `@error` menyebut kunci yang hilang per mode |
| `@include wui.palette('green')` dipanggil 2× | tidak ada variable dobel di output |

---

## 10. Risiko & jebakan

| Risiko | Detail | Mitigasi |
| --- | --- | --- |
| **Urutan `@forward` vs `@use`** | Configuration hanya mengalir lewat `@forward`. Terbukti di F0: kalau `@use` lebih dulu, build **gagal** (`This module was already loaded, so it can't be configured using "with"`). Jadi salah urutan = error keras, bukan warna salah diam-diam | Pindahkan `@forward 'themes';` ke atas `@use 'themes';` + komentar "urutan wajib" di `wui.scss` |
| "Modul sudah dimuat" | `with()` gagal kalau modul sudah dimuat tanpa config di graf kompilasi yang sama | Opsi B tersedia sebagai cadangan; di Angular tiap file dikompilasi terpisah |
| Lupa mengaktifkan palet | `--wui-color-primary: var(--wui-color-purple-500)` padahal skala tidak ter-emit → warna jadi *unset* | C8 (auto-include palet default) |
| Palet custom kurang lengkap | Tone yang dipakai peran semantik tidak ada → `var()` menunjuk variable kosong | Validasi kelengkapan saat resolusi (§5.3) → build gagal, bukan CSS rusak |
| `tokens` dimuat lebih awal dari rantai `@forward` | Konfigurasi `$wui-palettes-extra`/`$wui-palette` dari aplikasi gagal: `This module was already loaded…`. **Terbukti saat F2** (`functions` memuat `tokens` lebih dulu) | `@forward 'abstracts';` + `@forward 'themes';` di awal `wui.scss`, dan `@forward 'tokens';` **paling awal** di `abstracts/_index.scss` |
| **`null` tidak bisa mematikan palet** | `with ($wui-palette: null)` **diabaikan** karena `!default` menganggap `null` sebagai "belum diisi" → palet kembali ke default (terbukti saat F1) | Pakai sentinel `false` (C13); diuji ulang di F1 dan lolos |
| `color-mix()` dukungan browser | Butuh Chrome 111+ / Safari 16.2+ / Firefox 113+ (2023) | Bila target lebih tua: jalur cadangan alpha compile-time lewat `alpha()` (hex palet aktif sudah tersedia di Sass) |
| State layer bersifat transparan | Warnanya tembus pandang, jadi bukan warna dasar — harus dipakai di atas permukaan | Dokumentasikan pola pakainya: `background-color` untuk hover/pressed, atau overlay `::before` |
| Kunci map bertipe string | `palette(purple)` vs `palette('purple')` bisa tidak cocok | Normalisasi nama sebelum `map.get` (C9) |
| Ukuran CSS | 11 tone × 2 mode eksplisit + 11 mode-aware ≈ 33 variable per palet | C3 `$wui-palette-tones`; C4 hapus emisi ganda |
| Nama palet bentrok | `primary`, `background`, `text`, `outline`, `overlay` sudah dipakai token semantik | Guard `@error` (C9) |
| Palet brand di luar library | Konsumen punya warna sendiri | Escape hatch Opsi D dulu; Fase opsional: `@include palette($map, 'brand')` |
| ng-packagr & `exports` | Subpath `./scss/*` di `dist/package.json` masih ditimpa ng-packagr (isu lama, belum dimitigasi) | Diuji tersendiri di Fase 5 `scss-wui-plan.md` — bukan bagian planning ini |

---

## 11. Status keputusan & kesiapan F1

Semua keputusan yang dibutuhkan sebelum F1 sudah terjawab:

| # | Keputusan | Status |
| --- | --- | --- |
| — | Palet bawaan | ✅ **`purple` saja** untuk sekarang, dan dijadikan **default** (`$wui-palette: 'purple'`) |
| C1 | Mekanisme pemilihan | ✅ Opsi A (deklaratif `with()`); mixin `palette()` sebagai jalur cadangan |
| C5 | Peran semantik | ✅ `primary` + `on-primary`, masing-masing punya state layers |
| C10 | Runtime switch | ✅ ditunda; hanya palet aktif yang di-emit |
| C14 | Generator tone dari 1 warna | ❌ dibatalkan |
| C16 | Bentuk palet aplikasi | ✅ selalu lengkap, tanpa warisan tone; library hanya memvalidasi |
| C17 | Bentuk data `on-primary` | ✅ menempel di dalam `light`/`dark` |
| C18 | Daftar opacity | ✅ `0.08` hover / `0.10` pressed / `0.16` dragged |

Satu data yang masih menunggu nilai final (tidak menghalangi F1):

- `'on-primary'` untuk palet `purple` — sementara `#ffffff` (light) dan `#05000f` (dark), tinggal diganti
  nilai dari Figma setelah F1 selesai.
- Palet warna lain (`blue`, `green`, `yellow`, …) cukup ditambah sebagai entri baru di
  `$wui-palettes-builtin` kapan saja tanpa mengubah struktur — atau dari sisi aplikasi lewat
  `$wui-palettes-extra` bila memang milik aplikasi.
