# Planning — Struktur Peran Warna ala Material 3 `@wajek/wui`

> ## ⛔ SUDAH DIGANTIKAN — JANGAN DIPAKAI SEBAGAI ACUAN
>
> Arah "struktur peran ala M3" sudah **dieksekusi & diselesaikan** lewat
> **`docs/planning/wui-color-mtb-plan.md`** (prefix keputusan **M**), yang sekaligus mengganti sumber
> nilainya dengan export **Material Theme Builder**.
>
> Peta nasib keputusan di dokumen ini:
> — **nama peran** (S1–S4, S6, S10) ✅ diadopsi semuanya (S3 `error`, S6 `on-surface-variant`,
> S10 skala tone diganti model MTB absolut `0…100`).
> — **peran yang tadinya ditunda** (tertiary, 12 fixed, 3 inverse, dim/bright, scrim/shadow) ✅
> ter-emit, karena datang gratis dari skema MTB.
> — **K1** (nilai container) ✅ terjawab: nilainya dari skema MTB, tidak lagi diturunkan `color-mix`.
> — **K3** (`scrim`/`shadow` jadi peran) ✅ selesai; **K4** (alias `danger`) ✅ selesai (alias satu mayor).
> — **K2** (`success`/`warning`/`info`) ⏳ **masih terbuka** — dilacak terus sebagai K2 di sini; badge
> masih memakai hex keras untuk tiga varian itu.
> — **F3** (buang persen ad-hoc di komponen) ✅ selesai sebagai F3 di plan MTB.
>
> Dokumen ini disimpan sebagai **riwayat** (alasan & alternatif yang ditolak). Konvensi yang berlaku
> sekarang: `docs/panduan-warna.md` (kamus peran) + `docs/panduan-scss.md` §5.

> Tujuan: merapikan lapisan warna supaya **peran (role) mengikuti tata nama & himpunan Material 3**,
> sehingga komponen berhenti menulis nilai turunan sendiri (`color-mix` dengan persen ad-hoc di
> `_table.scss`, `_form-field.scss`, `_sidenav.scss`, `_loading.scss`, `_badge.scss`) dan cukup
> membaca peran seperti `--wui-color-outline-variant`.
>
> Tahap ini **hanya** menggarap lima grup: **primary, secondary, error, surface, outline** — beserta
> variannya. `tertiary`, fixed accent, dan inverse roles sengaja ditunda (lihat §0).

Status: **📝 draft — belum dieksekusi.** Keputusan yang sudah dikunci: S1–S4, S6, S10. Menunggu
keputusan user: K1 (nilai container), K2 (`success`/`warning`/`info`), K3 (`scrim`/`shadow`),
K4 (alias `danger`).
Semua pengetesan/pengukuran **dilakukan manual oleh user** (lihat `AGENTS.md` §1); dokumen ini hanya
mencantumkan daftar periksa, bukan instruksi menjalankan build.

Dokumen terkait: `docs/planning/scss-color-palette-plan.md` (F0–F1 ✅) ·
`docs/planning/wui-color-roles-plan.md` (C1–C4 ✅ — **prefix keputusan di dokumen itu `C`, di sini `S`**) ·
`docs/panduan-scss.md` §5 (kondisi warna sekarang) · `docs/panduan-komponen.md` (pemakai token).

---

## 0. Lingkup

| Masuk lingkup | Di luar lingkup (dicatat, belum diputuskan) |
| --- | --- |
| Grup **primary** (4 peran) | Grup **tertiary** (4 peran) — belum ada kebutuhannya |
| Grup **secondary** (4 peran) | **Fixed accent** (12 peran) — add-on, tidak dipakai |
| Grup **error** (4 peran) | **Inverse roles** (3 peran) — belum ada snackbar/tooltip |
| Grup **surface** (8 peran: 3 inti + 5 container) | `surface-dim` / `surface-bright` — add-on |
| Grup **outline** (2 peran) | Peran status non-M3: `success`, `warning`, `info` (K2) |
| Memakai peran itu di komponen (buang persen ad-hoc) | Runtime palette switching (sudah ditunda di C10) |
| Rename `on-surface-container` → `on-surface-variant` | Mode gelap manual (class/atribut) — masih `prefers-color-scheme` |

Rujukan spec: `m3.material.io/styles/color/roles` — *"There are 26 standard color roles organized
into six groups: primary, secondary, tertiary, error, surface, and outline"*; total **45** bila
add-on (5 surface container, 12 fixed accent, 2 bright/dim) ikut dihitung.

---

## 1. Kondisi sekarang

Sepuluh peran ditulis di `$wui-roles` (`themes/_roles.scss`) + 3 peran turunan `color-mix`:

| Peran sekarang | Nilai (light / dark) | Pemakai |
| --- | --- | --- |
| `primary` / `on-primary` | purple 500 / `#fff` · `#05000f` | button, badge, loading, focus ring, sidenav |
| `secondary` / `on-secondary` | magenta 500 / magenta 50 · 950 | badge |
| `danger` / `on-danger` | red 500 / red 50 · 950 | button, badge, form-field (error) |
| `surface` / `on-surface` | neutral 50 / 950 · neutral 900 / 50 | hampir semua komponen + `body` |
| `on-surface-container` | neutral 900 / 50 | **tidak ada** (peran mati) |
| `outline` | neutral 400 / 700 | topbar, sidenav, table, form-field |
| `surface-container` (turunan) | `color-mix(on-surface 5% / 8%, surface)` | badge, form-field (filled), blok kode |
| `default` / `on-default` (turunan) | `color-mix(on-surface 8% / 14%, surface)` / `on-surface` | button `color="default"`, sidenav item aktif |
| `disabled-container` / `disabled-content` | `color-mix(on-surface 12% / 38%)` | button, form-field |
| `state-layer-<peran>-opacity-08/10/16` | `color-mix(peran 8/10/16%, transparent)` | button, form-field, table |

**Nilai turunan yang ditulis di komponen** (yang mau dihapus oleh plan ini):

| Berkas | Angka ad-hoc | Seharusnya jadi peran |
| --- | --- | --- |
| `_form-field.scss` | label 70%, hint 65%, placeholder 50%, border hover 45% | `on-surface-variant`, `outline-variant` |
| `_table.scss` | divider 40% & 65%, tint baris 2% & 4% | `outline-variant`, `surface-container-*` |
| `_sidenav.scss` | divider 12%, teks sekunder 70% | `outline-variant`, `on-surface-variant` |
| `_badge.scss` | tint 15%, subtle 12%, outline 22% + 9 hex keras | `surface-container-*`, `outline-variant`; `success/warning/info` → K2 |
| `_loading.scss` | 20%, 60% | turunan dari `primary` (bukan peran baru) |
| `_pagination.scss` | *tidak ada* — sudah memakai `on-surface` apa adanya | — |

**Masalah ringkas**

1. Keluarga `*-container` + `on-*-container` tidak ada → komponen bikin sendiri dengan persen warna.
   Akibatnya komposisi `on-surface` di atas `surface-container` berbeda-beda antar komponen.
2. `outline` dipakai untuk garis divider (M3 melarang: divider = `outline-variant`) — nilai kontras
   divider jadi kebablasan.
3. Nama menyimpang dari M3: `danger` (M3: `error`), `default`/`on-default` (tidak ada di M3),
   `on-surface-container` (M3: `on-surface-variant`).
4. Skala palet kita `50…950` (11 tone), sedangkan M3 memakai 13 tone `0…100` — peran M3 tidak bisa
   disalin tone-nya apa adanya; kita perlu tabel pemetaan sendiri (§4).

---

## 2. Keputusan yang sudah dikunci

| # | Keputusan | Alasan singkat |
| --- | --- | --- |
| **S1** | Tahap ini menggarap **5 grup**: primary, secondary, error, surface, outline **+ variannya** | Sesuai permintaan user; grup lain ditunda supaya migrasi kecil dan bisa ditinjau |
| **S2** | Varian yang masuk = **container & on-container** untuk primary/secondary/error, **5 tingkat container** untuk surface, dan **`outline-variant`** | Ini yang menutup kebutuhan nyata komponen (permukaan berlapis, divider, teks sekunder) |
| **S3** | Nama grup error memakai **`error`** (bukan `danger`), mengikuti M3 | User menyebut "error"; satu-satunya nama status M3 yang kita punya |
| **S4** | Setiap peran **wajib punya pasangan `on-*`** dan pemasangannya dijaga: `container` tidak untuk teks/ikon | Aturan spec; mencegah pengulangan bug tombol (label `on-*` di atas warna peran) |
| **S6** | `on-surface-container` **dihapus** → diganti `on-surface-variant` | Peran lama tidak dipakai siapa pun (bukti: grep `--wui-color-on-surface-container` hanya di definisi) |
| **S10** | Skala tone **tetap `50…950`**; yang ditulis adalah **tabel pemetaan peran → tone** | Data palet sudah ada; pindah ke 13 tone M3 = pekerjaan desain terpisah. Pemetaan wajib eksplisit supaya pembaca tahu ini penyimpangan yang disengaja |

**Mitigasi yang ikut dikunci (paket dengan S2):** selama angka desainer belum ada, nilai container
**diturunkan di lapisan peran** (`themes/_roles.scss` → `derived-roles()`), **bukan** di komponen.
Begitu angka tone dari desainer turun, definisi turunan itu diganti nilai tone asli **tanpa menyentuh
komponen** — inilah inti manfaat plan ini.

---

## 3. Peran target (tahap ini)

> Arti, pasangan wajib, dan larangan tiap peran ada di **`docs/panduan-warna.md`** (kamus peran).
> Tabel di bawah hanya status migrasi — jangan menduplikasi definisinya di sini.

| Grup | Peran | Status |
| --- | --- | --- |
| Primary | `primary`, `on-primary`, `primary-container`, `on-primary-container` | 2 baru, 2 ada |
| Secondary | `secondary`, `on-secondary`, `secondary-container`, `on-secondary-container` | 2 baru, 2 ada |
| Error | `error`, `on-error`, `error-container`, `on-error-container` | 2 baru, 2 *rename* dari `danger` |
| Surface | `surface`, `on-surface`, `on-surface-variant`, `surface-container-lowest`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest` | 5 container baru; 3 inti sudah ada |
| Outline | `outline`, `outline-variant` | 1 baru |

Total: **22 peran** (dari 13 sekarang, dengan 1 dihapus). Peran yang **tetap sebagai ekstensi kita**
(bukan M3, didokumentasikan sebagai ekstensi): `default`, `on-default`, `disabled-container`,
`disabled-content`, `state-layer-*`. `default` nanti **didelegasikan** ke `surface-container`
(bukan lagi `color-mix` 8%/14% sendiri) supaya angka tint hanya hidup di satu tempat.

Peran `inverse-*`, `tertiary*`, dan fixed accent **tidak** di-emit pada tahap ini, tapi penamaannya
sudah dicadangkan di `$wui-palette-reserved` supaya tidak kepakai jadi nama palet.

---

## 4. Pemetaan peran → tone (proposal, menunggu angka desainer — **K1**)

Catatan penting soal model data kita: **angka tone = slot, bukan tone M3.** Nilai `500` di sub-peta
`light` berbeda dengan `500` di sub-peta `dark` (palet brand nilainya berbalik antar mode), jadi satu
pemetaan berlaku untuk dua mode.

| Peran | Tone (slot) | Catatan |
| --- | --- | --- |
| `primary` / `secondary` / `error` | `500` | seperti sekarang |
| `on-primary` / `on-secondary` / `on-error` | warna langsung `#fff` / `#05000f` | palet kita tidak punya tone netral murni — sama seperti sekarang |
| `*-container` | `50` (light) — perlu tone baru (dark) | ⏳ K1: butuh angka desainer; sementara diturunkan `color-mix` |
| `on-*-container` | `900` (light) — perlu tone baru (dark) | ⏳ K1 |
| `surface` | neutral `50` (light) / `950` (dark) | tetap |
| `on-surface` | neutral `900` / `50` | tetap |
| `on-surface-variant` | neutral `600` / `400` | ⏳ K1: dipilih supaya kontras ≥4.5:1 di atas `surface` |
| `outline` | neutral `400` / `700` | tetap |
| `outline-variant` | neutral `200` / `800` | ⏳ K1: harus lebih tenang dari `outline` |
| `surface-container-lowest … highest` | netral naik bertingkat (mis. `50 → 200` di light) | ⏳ K1; sekarang hanya ada satu `surface-container` |

**Kebutuhan palet**: M3 memisahkan `neutral` dan `neutral-variant`. Kita baru punya `neutral`.
Pilihan: (a) pakai `neutral` untuk keduanya (paling murah, kontras divider bisa terbatas), atau
(b) tambah palet `neutral-variant` (lebih setia ke M3, tapi butuh angka baru). **Usul: (a) dulu**,
dicatat sebagai utang bila hasil `outline-variant` terasa terlalu dekat dengan permukaan.

---

## 5. Rencana fase

| Fase | Isi | Bergantung pada |
| --- | --- | --- |
| **F0** | Dokumen ini disepakati (K1–K4 terjawab) + tabel migrasi `danger`→`error` ditulis di `projects/wui/README.md` | — |
| **F1** | Tambah peran ke `$wui-roles` (+ `$wui-palette-reserved`), perluas `derived-roles()` untuk container, emit `--wui-color-*` baru | F0 |
| **F2** | Tambah validator: pastikan **setiap `*-container` punya `on-*`-nya** dan `container` tidak dipakai di `color`/`fill` teks — `@error` dengan pesan jelas | F1 |
| **F3** | Ganti pemakaian di komponen: `_table.scss` (divider 2× + tint baris), `_form-field.scss` (4 angka), `_sidenav.scss` (2 angka), `_badge.scss` (tint) | F1 |
| **F4** | `danger` → `error` di komponen + alias `--wui-color-danger` (K4) selama satu mayor | F1 |
| **F5** | Bersihkan peran mati (`on-surface-container`), perbarui `docs/panduan-scss.md` §5 + `AGENTS.md` bila perlu | F3, F4 |
| **F6** | `success`/`warning`/`info` sesuai keputusan K2 (bisa jadi fase terpisah / dibatalkan) | K2 |

Prasyarat lint yang wajib diingat saat eksekusi (jangan terulang):
`custom-property-pattern` + `scss/dollar-variable-pattern` hanya menerima `wui-*` (jadi variabel baru
di dalam fungsi/mixin pun wajib `$wui-…`), dan `scss/comment-no-empty` menolak baris `//` kosong.

---

## 6. Yang belum dikunci

| # | Pertanyaan | Opsi | Usul |
| --- | --- | --- | --- |
| **K1** | Angka/tone untuk seluruh container, `on-surface-variant`, `outline-variant` | (a) pakai turunan `color-mix` sampai angka desainer ada · (b) tunggu desainer baru emit | **(a)** — strukturnya bisa jalan sekarang, nilainya tinggal ditukar belakangan |
| **K2** | `success`/`warning`/`info` di badge | (a) perluas sebagai ekstensi non-M3 dengan palet sendiri · (b) ganti bahasa visualnya ke `error` + netral (M3 tidak punya status ini) · (c) tunda, badge tetap seperti sekarang | **(a)** bila produk memang butuh status; dicatat tegas sebagai **ekstensi**, bukan bagian himpunan M3 |
| **K3** | `scrim` & `shadow` jadi peran? | (a) ya — `$wui-overlay-color` dan `$wui-elevation-*` didelegasikan ke peran ini sehingga bisa diganti per tema · (b) biarkan sebagai token non-peran | **(a)** — murah, dan menutup temuan "hitam keras" pada audit |
| **K4** | Cara rename `danger` → `error` | (a) alias `--wui-color-danger` dipertahankan satu mayor, lalu dibuang · (b) rename keras sekarang | **(a)** — konsumen masih punya waktu migrasi; ini perubahan **breaking** → naikkan versi **major** (lihat `docs/panduan-kerja.md` §3) |

---

## 7. Alternatif yang ditolak

| Alternatif | Alasan ditolak |
| --- | --- |
| Menyalin **45 peran** M3 sekaligus (termasuk tertiary, fixed, inverse, dim/bright) | Menambah ~30 var yang belum ada pemakainya; sulit ditinjau dan memperbesar permukaan breaking tanpa manfaat |
| Pindah ke **13 tone M3 (0–100)** sekarang | Butuh data palet baru dari desainer; menunda pekerjaan struktur yang bisa dikerjakan hari ini |
| Menyelesaikan pewarnaan dengan **persen `color-mix` di komponen** | Justru masalah yang mau dihapus: komposisi berbeda antar komponen, dan tidak bisa diserahkan ke desainer |
| Menghapus `default`/`on-default` (karena tidak ada di M3) | Dipakai tombol netral & item sidenav aktif; lebih aman didelegasikan ke `surface-container` sambil dipertahankan namanya |
| Menambah **validator kontras** otomatis di Sass | Sass tidak punya mesin kontras WCAG; menulisnya sendiri = skrip baru di luar lingkup |

---

## 8. Risiko

1. **Perubahan visual halus** saat `outline` diganti `outline-variant` di divider tabel/sidenav
   (memang tujuannya), tapi kalau tone `outline-variant` belum ada, divider jadi lebih samar dari
   sekarang → sementara tetap pakai turunan `outline` sampai K1 terjawab.
2. **`danger` → `error` menyentuh banyak berkas** (button, badge, form field, dan konsumen).
   Karena itu K4 memilih alias satu mayor.
3. **Tabel pemetaan tone usang** bila desainer mengubah palet → tabel di §4 wajib ikut diperbarui
   bersamaan dengan `_tokens.scss` (catat di `docs/panduan-scss.md`).

---

## 9. Daftar periksa (manual, dijalankan user)

Saat fase mulai dieksekusi, yang perlu user periksa — **agent tidak menjalankannya sendiri**:

- `npm run lint:styles` (hijau; khususnya tidak ada `!important` dan pola nama `wui-*`).
- `npm run build:wui` lalu `ng build` (build library + aplikasi).
- Mode **terang & gelap** di `http://wui.local`: tombol (3 varian warna × 3 tipe), form field
  (outlined + filled, keadaan invalid/hover/fokus), tabel (garis & tint baris), sidenav (garis footer,
  teks sekunder), badge (termasuk `success/warning/info` bila K2 = a), dialog.
- Kontras: teks sekunder (`on-surface-variant`) ≥ 4.5:1 terhadap `surface` **dan** terhadap tiap
  `surface-container-*` yang dipakainya; divider tidak boleh terbaca sebagai batas penting.
- Diff token sebelum/sesudah untuk peran yang **tidak** berubah nilainya.
