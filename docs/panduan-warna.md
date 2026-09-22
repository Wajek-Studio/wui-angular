# Panduan warna — definisi peran

Kamus peran warna `@wajek/wui`. Isinya **arti & aturan pakai**; **nilainya tidak ditulis di dokumen
ini** — semuanya datang dari export **Material Theme Builder** (MTB) dan masuk lewat satu variabel
konfigurasi, `$wui-schemes`:

```bash
npx wui-theme src/theme/material-theme.json     # → src/theme/_wui-schemes.scss
```

```scss
// src/styles.scss
@use './theme/wui-schemes' as theme;
@use '@wajek/wui/scss/wui.scss' with ($wui-schemes: theme.$wui-schemes);
```

Status: **✅ diimplementasikan** (F2b/F3/F5 di `docs/planning/wui-color-mtb-plan.md`) — **45 peran M3**
ter-emit untuk kedua mode, plus 4 kelompok ekstensi kita (§11). Skema bawaan library = export
`default.json` (seed `#593bb4`). Nama di sini = kunci MTB yang diubah camelCase → kebab-case
(`onSurfaceVariant` → `on-surface-variant`), jadi tidak ada terjemahan yang perlu dihafal.

Semua nama mengikuti Material 3 (`m3.material.io/styles/color/roles`), kecuali bagian
**Ekstensi kita** yang ditandai tegas.

---

## 1. Aturan umum (berlaku untuk semua peran)

1. **Berpasangan.** Teks/ikon hanya diletakkan di atas peran induknya: `on-primary` di atas
   `primary`, `on-primary-container` di atas `primary-container` — **bukan** silang
   (`on-primary` di atas `primary-container` dilarang, kontrasnya tidak dijamin).
2. **`container` = fill, bukan teks.** `*-container` tidak boleh dipakai sebagai `color` teks/ikon;
   untuk itu ada `on-*-container`.
3. **`on-*` berarti "di atas"**, bukan "warna terang/gelap". Nilainya boleh terang atau gelap
   tergantung mode.
4. **Teks penekanan rendah = `on-surface-variant`**, bukan `on-surface` + opacity. Ini yang
   menggantikan angka `color-mix(on-surface 65% / 70% / 50%)` yang sekarang tersebar di komponen.
5. **Garis batas vs dekorasi**: batas target (border input, border tombol outlined) = `outline`;
   divider/pemisah baris & grid = `outline-variant`. Jangan pakai `outline` untuk divider.
6. **Hierarki permukaan** memakai `surface` + `surface-container-*`, bukan tint buatan sendiri
   (`color-mix(on-surface 2%)`, dst.).
7. **State layer menumpuk di atas peran**, bukan peran baru: hover/pressed/dragged memakai
   `state-layer-<peran>-opacity-08/10/16`.
8. **Nama peran tidak dikarang bebas.** Menambah peran di luar daftar ini = keputusan yang harus
   ditulis di plan + dokumen ini, bukan langsung di komponen.
9. **Nilai hanya datang dari skema.** Jangan menulis hex di komponen; kalau sebuah warna belum punya
   peran, itu keputusan desain — bukan tambalan di satu komponen (utang yang tetap tercatat: 3 warna
   status di `_badge.scss`, lihat §12).
10. **Divalidasi saat build.** `$wui-role-required` (18 peran yang dibaca komponen) wajib ada di
    setiap skema, dan setiap `X`/`X-container` wajib punya `on-*`-nya — kalau tidak, build gagal
    dengan menyebut peran yang hilang.
---

## 2. Primary — aksen paling penting

Untuk elemen yang paling menonjol dan butuh perhatian utama (aksi utama, state aktif).

| Peran | Arti | Dipakai untuk |
| --- | --- | --- |
| `primary` | fill/teks/ikon aksen utama di atas `surface` | tombol filled primary, ikon item aktif, focus ring, progress/loading |
| `on-primary` | teks & ikon di atas `primary` | label tombol filled primary |
| `primary-container` | fill menonjol di atas surface untuk komponen kunci (bukan untuk teks) | chip terpilih, kartu terpilih, badge penekanan tinggi |
| `on-primary-container` | teks & ikon di atas `primary-container` | label di dalam chip/kartu terpilih |

---

## 3. Secondary — aksen pendukung

Untuk elemen penting yang **tidak** mendesak; memberi tekanan tanpa bersaing dengan primary.

| Peran | Arti | Dipakai untuk |
| --- | --- | --- |
| `secondary` | fill/teks/ikon aksen pendukung di atas `surface` | state terpilih navigasi, tombol dismissif, badge |
| `on-secondary` | teks & ikon di atas `secondary` | label tombol secondary |
| `secondary-container` | fill resesif untuk komponen tonal | tonal button, chip terpilih, latar item terpilih |
| `on-secondary-container` | teks & ikon di atas `secondary-container` | label item terpilih |

---

## 4. Error — keadaan salah

Di M3 ini **satu-satunya** peran status (berkas: `success`, `warning`, `info` tidak ada di M3 —
lihat §8). Sifatnya *static*: tidak ikut berubah pada skema warna dinamis, tapi tetap menyesuaikan
mode terang/gelap.

| Peran | Arti | Dipakai untuk |
| --- | --- | --- |
| `error` | fill/teks/ikon penanda kesalahan | teks bantuan error, border invalid, tombol aksi berbahaya |
| `on-error` | teks & ikon di atas `error` | label tombol `error` filled |
| `error-container` | fill latar untuk pesan kesalahan | latar alert/dialog error, banner |
| `on-error-container` | teks & ikon di atas `error-container` | isi pesan error |

Catatan migrasi: `danger`/`on-danger` sudah diganti `error`/`on-error`. **Alias satu mayor masih
ada** — `--wui-color-danger` di-emit sebagai `var(--wui-color-error)`, dan input `color="danger"`
pada tombol & badge masih diterima (memetakan ke class `--color-error`).

---

## 5. Surface — latar & hierarki permukaan

| Peran | Arti | Dipakai untuk |
| --- | --- | --- |
| `surface` | latar default | `body`, area konten halaman, permukaan dialog |
| `on-surface` | teks & ikon utama di atas semua permukaan | warna teks default dokumen |
| `on-surface-variant` | teks & ikon penekanan rendah di atas semua permukaan | hint form, label, teks sekunder, placeholder |
| `surface-container-lowest` | permukaan paling rendah | area yang harus tenggelam (mis. latar bagian kosong) |
| `surface-container-low` | permukaan rendah | kartu, baris tabel, blok kode |
| `surface-container` | permukaan default | topbar, sidenav, bilah navigasi |
| `surface-container-high` | permukaan tinggi | FAB, dialog dasar, popover |
| `surface-container-highest` | permukaan tertinggi | label input mengapung, elemen paling menonjol |
| `surface-dim` | varian permukaan yang lebih redup dari `surface` | latar sekunder yang harus tenggelam |
| `surface-bright` | varian permukaan yang lebih terang dari `surface` | area yang perlu terasa lebih "naik" |

Pemetaan komponen di atas mengikuti anjuran M3 (surface container untuk navigation area, high untuk
dialog/FAB, highest untuk elemen paling menonjol). Yang **tidak berubah**: `surface` tetap dipakai
untuk area konten; hierarki dicapai dengan `container-*`, bukan dengan menambah shadow.

Peran `scrim` & `shadow` yang dulu masih berstatus usulan (K3) **sudah jadi peran ter-emit** — lihat §10.

---

## 6. Outline — garis

| Peran | Arti | Dipakai untuk |
| --- | --- | --- |
| `outline` | garis batas yang penting, kontras lebih tinggi | border input, border tombol outlined, garis pemisah kuat |
| `outline-variant` | garis dekoratif, kontras rendah | divider baris tabel, garis antar-item sidenav, grid |

Sejak F3 tidak ada lagi opacity tulisan tangan: divider di `_table.scss` & `_sidenav.scss` memakai
`outline-variant`, sedangkan `_topbar.scss` dan tepi panel sidenav tetap `outline` (itu **batas**,
bukan divider).

---

## 7. Tertiary — aksen ketiga

Aksen tambahan untuk membedakan area/aksi yang tidak boleh bersaing dengan `primary`. Karena skema
datang dari MTB, grup ini **ikut terisi otomatis** — tidak ada nilai yang perlu dipilih sendiri.

| Peran | Arti | Dipakai untuk |
| --- | --- | --- |
| `tertiary` | fill/teks/ikon aksen ketiga | aksen dekoratif, penanda kategori |
| `on-tertiary` | teks & ikon di atas `tertiary` | label di atas `tertiary` |
| `tertiary-container` | fill tonal dari grup ini | chip/kartu kategori |
| `on-tertiary-container` | teks & ikon di atas `tertiary-container` | label di dalamnya |

Grup ini sudah punya **state layer** (`--wui-color-state-layer-tertiary-opacity-08/10/16`), tapi
belum dipakai komponen mana pun.

---

## 8. Inverse — untuk elemen yang membalik permukaan

Dipakai elemen yang sengaja "terbalik" dari permukaan sekitarnya (mis. snackbar/tooltip). Nilainya
sudah ter-emit, pemakainya belum ada.

| Peran | Arti |
| --- | --- |
| `inverse-surface` | permukaan yang berlawanan dengan `surface` mode tersebut |
| `inverse-on-surface` | teks & ikon di atas `inverse-surface` |
| `inverse-primary` | `primary` yang terbaca di atas `inverse-surface` |

---

## 9. Fixed accent — aksen yang sama di dua mode

Satu-satunya kelompok yang nilainya **identik di mode terang & gelap** (M3 memakainya untuk elemen
yang harus konsisten, mis. kontainer bermerek).

| Grup | Peran |
| --- | --- |
| primary | `primary-fixed`, `on-primary-fixed`, `primary-fixed-dim`, `on-primary-fixed-variant` |
| secondary | `secondary-fixed`, `on-secondary-fixed`, `secondary-fixed-dim`, `on-secondary-fixed-variant` |
| tertiary | `tertiary-fixed`, `on-tertiary-fixed`, `tertiary-fixed-dim`, `on-tertiary-fixed-variant` |

Akhiram `-fixed-dim` = versi yang lebih redup; `on-*-fixed-variant` = teks di atas `-fixed` di mode
**terang**. Belum ada komponen yang memakainya — tersedia untuk kebutuhan baru.

---

## 10. Netral murni — `shadow` & `scrim`

| Peran | Arti | Dipakai untuk |
| --- | --- | --- |
| `shadow` | warna bayangan elevasi | `--wui-elevation-*` |
| `scrim` | lapisan gelap di belakang overlay/modal | `--wui-overlay-color` |

Nilainya dari MTB selalu `#000` di kedua mode.

⚠️ **Utang**: peran ini sudah ter-emit, tapi `$wui-overlay-color` (`rgb(0 0 0 / 40%)`) dan
`$wui-elevation-1` (`rgb(0 0 0 / 30%)`) di `abstracts/_tokens.scss` **belum** dipindah ke peran ini —
jadi masih ada nilai keras untuk overlay/elevasi (dicatat juga di plan §9).

---

## 11. Ekstensi kita (BUKAN bagian dari himpunan M3)

Ditandai tegas supaya tidak ada yang menganggapnya standar. Nama tetap `wui-*` dan tetap
didokumentasikan di sini.

| Peran | Arti | Catatan |
| --- | --- | --- |
| `default` | permukaan netral untuk elemen interaktif non-aksen | sejak M8 = `var(--wui-color-surface-container-high)` — tidak lagi tint sendiri; dipakai tombol `color="default"` & item sidenav aktif |
| `on-default` | teks & ikon di atas `default` | = `on-surface` |
| `disabled-container` | fill elemen nonaktif | M3: `on-surface` + alpha 12% |
| `disabled-content` | teks/ikon nonaktif | M3: `on-surface` + alpha 38% |
| `state-layer-<peran>-opacity-08/10/16` | lapisan interaksi (hover/pressed/dragged) | opacity mengikuti `$wui-state-layer-opacities`; peran yang tidak ada di skema dilewati (peran wajib sudah dijaga `$wui-role-required`) |

---

## 12. Sengaja tidak dipakai / masih terbuka

| Kandidat | Status | Keterangan |
| --- | --- | --- |
| `background`, `onBackground` | ✅ dilewati | deprecated di M3 — nilainya identik dengan `surface`/`on-surface`; generator melewatinya & mencatatnya di header berkas generated |
| `surfaceVariant` | ✅ dilewati | deprecated M3 — pakai `surface-container-highest` |
| `surfaceTint` | ✅ dilewati | deprecated M3 — elevasi tidak lagi memakai tint |
| `success`, `warning`, `info` | ⏳ **K2** (plan struktur) | **bukan peran M3**; badge masih memakai hex keras untuk ketiga varian ini — satu-satunya warna keras di komponen |
| Varian kontras MTB (`light-medium-contrast`, `dark-high-contrast`, …) | ⏳ **M5** | 4 skema tambahan; melipatgandakan CSS, ditunda |
| Ganti mode manual (class/atribut) & ganti palet saat runtime | ⏳ ditunda | sekarang hanya `prefers-color-scheme` (C10) |

---

## 13. Peta pemilihan cepat

| Kebutuhan | Peran |
| --- | --- |
| Aksi utama, state aktif | `primary`, `on-primary` |
| Aksi penting tapi sekunder / state terpilih navigasi | `secondary`, `on-secondary` |
| Aksen ketiga / penanda kategori | `tertiary`, `on-tertiary` |
| Kesalahan & aksi berbahaya | `error`, `on-error` |
| Pesan/alert berisi kesalahan | `error-container`, `on-error-container` |
| Latar halaman | `surface` |
| Teks biasa | `on-surface` |
| Teks sekunder/label/hint/placeholder | `on-surface-variant` |
| Baris tabel selang-seling, blok kode, kartu | `surface-container-low` |
| Topbar, sidenav, bilah navigasi | `surface-container` |
| Tombol netral, item sidenav aktif | `default` (= `surface-container-high`), `on-default` |
| Dialog, FAB, popover | `surface-container-high` |
| Badge/chip tonal | `*-container` + `on-*-container` |
| Border input, border tombol outlined | `outline` |
| Divider baris tabel & garis antar-item sidenav | `outline-variant` |
| Hover/pressed/dragged | `state-layer-<peran>-opacity-08/10/16` |
| Overlay/modal, bayangan | `scrim`, `shadow` (§10 — peran tersedia, komponen belum memakainya) |
