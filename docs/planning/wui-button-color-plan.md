# Planning — Peran Warna Tombol (`color`) `@wajek/wui`

> Tujuan: tombol punya **sumbu warna** di samping sumbu bentuk (`variant`) dan ukuran (`size`):
> `color="default | primary | danger"`. Warna tidak disimpan di komponen — komponen hanya membaca
> token peran, sehingga mengganti warna cukup dari `$wui-roles` di `src/styles.scss`.

Status: **✅ dieksekusi (17 Sep 2026)** — lint + 2 build hijau; seluruh 9 kombinasi (3 warna × 3 varian)
diukur di browser pada mode terang & gelap.
**Revisi 2 (17 Sep 2026) setelah review user:** varian `outlined`/`text` sebelumnya memakai peran `on-*`
sebagai label (akibatnya label `primary` tampil putih dan nyaris tak terlihat) → sekarang memakai peran
warna itu sendiri (`accent`). Border `outlined` juga mengikuti warna peran (revisi keputusan #4).
Prasyarat: `docs/planning/wui-color-roles-plan.md` (refaktor palet → peran, sudah selesai).
Terkait: `docs/planning/wui-button-plan.md` (varian bentuk), `wui-button-icon-plan.md`.

---

## 0. Lingkup

| Masuk lingkup | Di luar lingkup |
| --- | --- |
| Input `color` dengan tiga nilai: `default` (netral), `primary`, `danger` | Warna lain (`success`, `warning`, `info`) — polanya sudah siap, tinggal tambah peran |
| Berlaku untuk ketiga `variant` (filled/outlined/text) × 4 ukuran | Varian bentuk baru (`elevated`, `tonal`), FAB, toggle |
| Peran `default`/`on-default` yang **diturunkan** dari `surface`/`on-surface` | Menambah tone baru di palet `neutral` (tidak perlu) |
| State layer mengikuti warna (satu mekanisme, bukan token per warna) | Perubahan kontras/border khusus per warna |

---

## 1. Keputusan (sudah dikunci user)

| # | Keputusan | Hasil |
| --- | --- | --- |
| 1 | Warna default tombol | **Netral** — `color` default = `default`, jadi tombol tanpa `color` tampil netral (bukan brand) |
| 2 | Sumber warna netral | **Diturunkan dari `surface` + `on-surface`**, bukan tone yang dipatok: `default` = tint `on-surface` di atas `surface`. Setara tone `neutral.200` (terang) / `neutral.800` (gelap) — jadi customisasi tetap mengalir **palet → peran → UI** |
| 3 | Warna aksi destruktif | `danger` dari palet `red` (placeholder sampai desainer selesai) |
| 4 | Border `outlined` | **Direvisi (revisi 2)**: border mengikuti warna peran untuk `primary`/`danger`; `default` tetap `--wui-color-outline` yang lebih tenang |

---

## 2. Rancangan

### 2.1 Peran `default` / `on-default` (turunan, bukan tone baru)

`themes/_roles.scss` — `derived-roles()` meng-emit dua peran ini **hanya bila tidak dideklarasikan**
di `$wui-roles`, jadi aplikasi tetap bisa menimpanya:

```scss
--wui-color-default: color-mix(in srgb, var(--wui-color-on-surface) 8%, var(--wui-color-surface));
--wui-color-on-default: var(--wui-color-on-surface);
```

Kekuatan tint-nya token: `$wui-default-container-tint: ('light': 0.08, 'dark': 0.14)` di
`abstracts/_tokens.scss`. Karena nilainya `color-mix()` dari `surface`/`on-surface`, mengganti palet
`neutral` (atau peran `surface`) otomatis menggeser tombol netral.

### 2.2 Indirection di komponen (inti penghematan CSS)

Tanpa ini, 3 warna × 3 varian × 5 state = 45 aturan. Dengan indirection, varian cukup membaca dua
variabel dan tiap warna hanya menambah 2 baris:

```scss
.wui-button                 { --wui-button-container: var(--wui-color-default); --wui-button-content: var(--wui-color-on-default); --wui-button-accent: var(--wui-color-on-surface); --wui-button-outline: var(--wui-color-outline); }
.wui-button--color-primary  { --wui-button-container: var(--wui-color-primary); --wui-button-content: var(--wui-color-on-primary); --wui-button-accent: var(--wui-color-primary); --wui-button-outline: var(--wui-color-primary); }
.wui-button--color-danger   { --wui-button-container: var(--wui-color-danger);  --wui-button-content: var(--wui-color-on-danger);  --wui-button-accent: var(--wui-color-danger);  --wui-button-outline: var(--wui-color-danger); }
```

Arti keempatnya: `container` = latar `filled`, `content` = label di atas container (peran `on-*`),
`accent` = label `outlined`/`text` **dan** warna state layernya, `outline` = border `outlined`.
Untuk `default`, `accent` memakai `on-surface` supaya tetap terbaca.

- `filled` → `background-color: var(--wui-button-container); color: var(--wui-button-content)`.
- `outlined` → `color: var(--wui-button-accent)`, `border: 1px solid var(--wui-button-outline)`.
- `text` → `color: var(--wui-button-accent)`, tanpa border.
- Disabled tetap netral (12% / 38% dari `on-surface`) untuk **semua** warna — tidak perlu aturan baru.

### 2.3 State layer lintas warna

`state-layer()` lama terikat **nama peran** (nama token ikut berubah), sehingga tidak bisa dipakai
untuk warna yang ditukar dari CSS. Ditambahkan satu fungsi + satu parameter:

```scss
@function state-layer-color($wui-color-var, $opacity, $surface: null) { … }   // abstracts/_functions.scss
@mixin interactive-state($wui-role: 'primary', $wui-surface: null, $wui-color-var: null) { … }
```

Pemakaian di tombol:

```scss
// filled — lapisan dicampur ke container supaya warna dasarnya tidak tertimpa
@include a.interactive-state($wui-surface: var(--wui-button-container), $wui-color-var: '--wui-button-content');

// outlined / text — lapisan transparan
@include a.interactive-state($wui-color-var: '--wui-button-content');
```

Mixin lama tetap kompatibel: tanpa `$wui-color-var`, perilakunya persis seperti sebelumnya
(dipakai `interactive-state('primary')` di komponen lain).

### 2.4 API Angular

```html
<button wuiButton>Netral (default)</button>
<button wuiButton color="primary">Brand</button>
<button wuiButton color="danger" variant="outlined">Hapus</button>
<button wuiButton color="danger" iconOnly aria-label="Hapus"><wui-icon icon="delete"></wui-icon></button>
```

`WuiButton` menambah input `color` (tipe `WuiButtonColor`) + tiga host class
(`wui-button--color-default|primary|danger`).

---

## 3. Hasil terukur (browser, transisi dimatikan)

| Tombol | Light | Dark |
| --- | --- | --- |
| `default` filled | latar `#EBE6ED` (≈ `neutral.200`), label `#1a1a1a` | latar `#343239` (≈ `neutral.800`), label `#f5f5f5` |
| `primary` filled | `#320095` + label `#fff` | `#d9d0ff` + label `#05000f` |
| `danger` filled | `#b3261e` + label `#fff5f4` | `#f2b8b5` + label `#601410` |
| `default`/`primary`/`danger` outlined | latar transparan, border `#CAC4D5` (default) / `#320095` (primary) / `#b3261e` (danger), label mengikuti warna peran | latar transparan, border `#484553` / `#d9d0ff` / `#f2b8b5` |
| `*` text | latar transparan, label mengikuti peran | idem |
| `default` filled `.is-hover` / `.is-pressed` | `#DAD6DE` / `#D6D2DC` | lebih terang dari normal (tint `on-surface`) |
| `disabled` (semua warna) | netral 12% + label 38% | idem (dari `on-surface` mode gelap) |

---

## 4. Struktur file

| Berkas | Perubahan |
| --- | --- |
| `abstracts/_tokens.scss` | `$wui-default-container-tint` (8% / 14%) |
| `abstracts/_functions.scss` | `state-layer-color()` |
| `abstracts/_mixins.scss` | `interactive-state()` menerima `$wui-color-var` |
| `themes/_roles.scss` | peran turunan `default` / `on-default` |
| `src/button/button.options.ts` | tipe `WuiButtonColor` |
| `src/button/button.ts` | input `color` + 3 host class + dokumentasi JSDoc |
| `scss/components/_button.scss` | blok peran warna + varian membaca `--wui-button-*` |
| `src/app/pages/button/**` | catatan diperbarui, tabel `color`, bagian 7 (3 warna × 3 varian) |
| `docs/planning/wui-button-plan.md` | baris G6 menunjuk dokumen ini |

---

## 5. Fase

| Fase | Isi | Status |
| --- | --- | --- |
| **G6.1** | Peran `default`/`on-default` turunan + token tint | ✅ |
| **G6.2** | Fungsi `state-layer-color()` + `interactive-state($wui-color-var)` | ✅ |
| **G6.3** | Indirection variable + blok peran warna di `_button.scss` | ✅ |
| **G6.4** | Input `color` + host class + JSDoc | ✅ |
| **G6.5** | Halaman demo (tabel `color` + bagian 7) & verifikasi browser 2 mode | ✅ |

---

## 6. Verifikasi

```sh
docker exec -w /workspace wui_angular_dev sh -c "npm run lint:styles"
docker exec -w /workspace wui_angular_dev sh -c "npx ng build wui && npx ng build --configuration development"
docker exec -w /workspace wui_angular_dev sh -c "grep -c -e 'wui-button--color-danger' www/styles.css"
```

| Cek | Hasil |
| --- | --- |
| Lint + 2 build | ✅ hijau |
| Kelas warna ter-emit | ✅ `--color-default`, `--color-primary`, `--color-danger` |
| 9 kombinasi × 2 mode | ✅ nilai sesuai tabel §3 |
| Tombol tanpa `color` | ✅ netral (perilaku baru yang disepakati) |
| Disabled semua warna | ✅ tetap netral 12% / 38% |
| Warna lain | Cukup tambah peran di `$wui-roles` + 2 baris di `_button.scss` |

---

## 7. Risiko & catatan

| Catatan | Detail |
| --- | --- |
| **Perubahan visual yang disengaja** | Tombol tanpa `color` kini netral (sebelumnya primary). Ini keputusan user; tombol brand harus ditulis `color="primary"` |
| Kontras `default` filled | `#1a1a1a` di atas `#EBE6ED` ≈ 13:1, dan `#f5f5f5` di atas `#343239` ≈ 12:1 — aman |
| Border `outlined` | Tetap `outline` (netral) untuk semua warna; bila nanti ingin mengikuti warna peran, cukup satu aturan tambahan per warna |
| Peran turunan & state layer | `default`/`on-default` **tidak** masuk `$wui-state-layer-roles` (daftar itu memvalidasi peran yang ditulis di `$wui-roles`); tombol menghitung lapisan langsung dari `--wui-button-content` |
| Pengukuran di browser | `background-color` tombol punya `transition` 0.24s; saat halaman pratinjau **tidak terlihat**, transisi tidak maju sehingga `getComputedStyle` melaporkan nilai lama. Matikan transisi (`* { transition: none !important }`) sebelum mengukur |
| Palet `red` masih placeholder | Kontras `danger` mengikuti baseline M3; setelah desainer menetapkan palet final, cukup ganti tone-nya |
