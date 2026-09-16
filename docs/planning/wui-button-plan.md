# Planning — Komponen Button (Material 3) `@wajek/wui`

> Tujuan: tombol bergaya **Material 3** untuk tiga varian warna (`filled`, `outlined`, `text`),
> empat ukuran (`sm`, `md`, `lg`, `xl`), dan lima keadaan (`normal`, `hover`, `active/pressed`,
> `focus`, `disabled`) — memakai token warna, state layer, dan tipografi yang sudah ada di library.

Status: **Draft untuk direview** — belum ada file yang dibuat/diubah.
Sumber spesifikasi: `m3.material.io/components/buttons/specs` (dibaca langsung) + baseline M3.
Dokumen terkait: `docs/planning/scss-structure-plan.md` (5 level), `docs/planning/scss-color-palette-plan.md`
(palet, peran semantik, state layer — sudah selesai F1–F3), `docs/planning/scss-wui-plan.md` (distribusi).

---

## 0. Lingkup

| Masuk lingkup | Di luar lingkup (dicatat untuk nanti) |
| --- | --- |
| Varian: `filled`, `outlined`, `text` | `elevated`, `tonal`, toggle button, FAB, icon button |
| Ukuran: `sm` `md` `lg` `xl` | `xs` (32px sudah dipakai sebagai `sm`) dan `xl` versi 96dp |
| State: normal, hover, focus-visible, pressed/active, disabled | Morph bentuk saat pressed, shape `square` |
| Materi yang diberikan M3: warna peran, state layer, radius penuh, tipografi label, elevasi saat hover | Ikon opsional (masuk Fase 2 — struktur & token disiapkan) |

Catatan sumber: yang **terbaca langsung** dari halaman spec M3 — jumlah ukuran ada 5 (XS, S, M, **default = small**),
shape `round` (default) & `square`, radius tiap ukuran (`12/12/16/28/28` untuk square, pressed `8/8/12/16/16`),
"container filled/outlined/text tak terlihat saat diam", elevasi default/disabled, anatomy (container + label + ikon),
target sentuh minimal 48dp, dan kecil (S) disarankan padding **16dp** (bukan 24dp). Nilai tinggi/padding/ikon
di bawah adalah **usulan** berbasis baseline M3 — mudah diganti karena semuanya di satu map (§6), dan
silakan koreksi bila Figma `wui/*` Anda sudah punya angkanya sendiri.

---

## 1. Kondisi sekarang (yang bisa dipakai)

| Sudah ada | Dipakai untuk |
| --- | --- |
| `--wui-color-primary`, `--wui-color-on-primary` | container & label tombol `filled` |
| `--wui-color-outline`, `--wui-color-text`, `--wui-color-background` | border `outlined`, label `text`, permukaan |
| `--wui-color-state-layer-<role>-opacity-08/10/16` + `a.state-layer()` | hover/pressed/dragged |
| `@mixin a.interactive-state($role)` | hover/pressed/dragged otomatis (perlu satu perluasan, §4.3) |
| `@mixin a.focus-ring` | cincin fokus keyboard (`:focus-visible`) |
| `@mixin a.typography('label', 'large')` + `a.space(...)` | tipografi label & padding |
| `@mixin a.media-up()` | bila nanti butuh penyesuaian responsif |

Yang **belum ada** dan perlu ditambah:

| Kebutuhan | Rencana |
| --- | --- |
| Warna disabled M3 (`on-surface` 12% untuk container, 38% untuk label/border) | token baru `--wui-color-disabled-container` / `--wui-color-disabled-content` (§4.2) |
| Elevasi (filled hover = elevation 1) | token `$wui-elevation-1` → `--wui-elevation-1` |
| Ukuran tombol (tinggi, padding, ikon, skala label, radius) | map `$wui-button-sizes` (§4.1) |
| Style tombol | `scss/components/_button.scss` |
| Komponen Angular | `projects/wui/src/button/button.ts` — directive `[wuiButton]` |

---

## 2. Matriks spesifikasi → implementasi

### 2.1 Varian warna (3 varian)

| | Container (normal) | Label/ikon | Saat hover & pressed |
| --- | --- | --- | --- |
| `filled` | `--wui-color-primary` | `--wui-color-on-primary` | lapisan `on-primary` 8% / 10% **di atas** primary (elevasi 1 saat hover) |
| `outlined` | transparan + border 1px `--wui-color-outline` | `--wui-color-primary` | lapisan `primary` 8% / 10% |
| `text` | transparan (tanpa border) | `--wui-color-primary` | lapisan `primary` 8% / 10% |

### 2.2 Ukuran (4 ukuran)

`md` = **40px**, yaitu tombol default M3. Ladder empat tingkat pertama M3: XS → S → M → L.

| Token | `sm` | `md` | `lg` | `xl` |
| --- | --- | --- | --- | --- |
| tinggi | `2rem` (32) | `2.5rem` (40) | `3rem` (48) | `3.5rem` (56) |
| padding inline (`filled`/`outlined`) | `1rem` (16) | `1.5rem` (24) | `1.75rem` (28) | `2rem` (32) |
| padding inline (`text`) | `0.5rem` (8) | `0.75rem` (12) | `1rem` (16) | `1.25rem` (20) |
| ukuran ikon | `1rem` (16) | `1.125rem` (18) | `1.25rem` (20) | `1.5rem` (24) |
| skala label | `label-medium` | `label-large` | `label-large` | `title-medium` |
| radius | penuh | penuh | penuh | penuh |

- Padding `sm` = 16px dan `md` = 24px sejalan dengan rekomendasi M3 di halaman spec.
- Radius "penuh" = `9999px` (bentuk pil), sesuai shape `round` default M3.
- Jarak ikon ↔ label = `--wui-space-2` (8px), sesuai baseline M3.
- M3 juga punya `XL` 96dp (untuk hero); **tidak** dipakai di sini supaya ladder berhenti di 56px.

### 2.3 State

| State | `filled` | `outlined` | `text` |
| --- | --- | --- | --- |
| normal | container primary, label on-primary, elevasi 0 | border `outline`, label primary | label primary |
| hover | elevasi 1 + lapisan on-primary **8%** | lapisan primary **8%** | lapisan primary **8%** |
| focus-visible | cincin fokus (warna mengikuti varian, §4.4) + lapisan **10%** bila juga di-hover | idem | idem |
| pressed (`:active`) | elevasi 0 + lapisan on-primary **10%** | lapisan primary **10%** | lapisan primary **10%** |
| disabled | container `--wui-color-disabled-container` (12%), label `--wui-color-disabled-content` (38%) | border & label disabled 12% / 38% | label 38% |

Angka 8% / 10% / 16% (dragged) sudah menjadi token palet (§ state layer F3) — tombol tidak menambah angka baru.
Angka 12% / 38% adalah nilai disabled M3 dan menjadi token baru `--wui-color-disabled-*`.

---

## 3. Keputusan yang perlu dikunci

| # | Keputusan | Rekomendasi saya |
| --- | --- | --- |
| B1 | Bentuk API di HTML | **Attribute directive pada `<button>` native**: `<button wuiButton variant="filled" size="md">`. Lebih baik untuk form/a11y (atribut `disabled`, `type`, `form` tetap milik browser) |
| B2 | Ukuran default & ladder | `md` = 40px; `sm/md/lg/xl` = 32/40/48/56 (§2.2) |
| B3 | Radius | `round` (pil, `9999px`) saja. Shape `square` + morph saat pressed → Fase 3 |
| B4 | Tipografi label | `label-large` untuk `md`/`lg`, `label-medium` untuk `sm`, `title-medium` untuk `xl` |
| B5 | Elevasi hover | Ya — `filled` naik ke elevation 1 (token baru), varian lain tetap 0 |
| B6 | Cincin fokus | `:focus-visible` → cincin 2px + offset 2px dari `a.focus-ring` (warna primary) untuk **semua** varian. ~~Warna cincin mengikuti varian~~ → **direvisi saat G1**: cincin berada di luar container (offset 2px) sehingga tidak menyatu dengan container; `currentcolor` justru berbahaya di `filled` karena on-primary (putih di mode terang) tidak terlihat di atas latar halaman |
| B7 | Cara menumpuk state layer | **`color-mix()` komposit** (`color-mix(in srgb, var(--wui-color-on-primary) 8%, var(--wui-color-primary))`) — satu deklarasi, tanpa pseudo-element, tanpa menimpa warna dasar |
| B8 | Perluasan `interactive-state()` | Tambah parameter opsional `$surface`: `a.interactive-state('on-primary', var(--wui-color-primary))` → otomatis jadi komposit; tanpa `$surface` perilakunya tetap seperti sekarang |
| B9 | Class pembantu QA | ✅ Sediakan `.is-hover` & `.is-pressed` (seperti `.is-dragged` yang sudah ada) supaya hover/pressed bisa dipotret di halaman demo tanpa menyentuh mouse |
| B10 | Penempatan token disabled & elevasi | Di `themes/_light-theme.scss` (grup token tak bergantung mode, seperti z-index/motion) — tidak perlu file baru |
| B11 | Ikon | **Fase 2**. Struktur disiapkan sekarang (gap + `--wui-button-icon-size`), tanpa menyentuh markup ikon |
| B12 | `min-width` | Tidak dipakai — lebar mengikuti padding + konten (lebih sederhana, dan M3 punya varian padding 16/24) |
| B13 | Label panjang | `white-space: nowrap` (tombol tidak membungkus teks) |

> Status: **semua keputusan di atas disetujui** (16 Sep 2026). B11 (ikon) tetap di Fase G3;
> B9 (class QA `.is-hover`/`.is-pressed`) dipakai di halaman demo G2.

---

## 4. Rancangan teknis

### 4.1 Data ukuran (`abstracts/_tokens.scss`, seksi baru `── Button (M3) ──`)

```scss
// Satu sumber kebenaran ukuran tombol. Mengubah satu angka = mengubah CSS variable dan
// deklarasi komponen sekaligus. Semua nilai rem agar ikut pengaturan ukuran font pengguna.
$wui-button-sizes: (
  'sm': ('height': 2rem,   'padding': 1rem,    'padding-text': 0.5rem,  'icon': 1rem,     'label-role': 'label', 'label-size': 'medium'),
  'md': ('height': 2.5rem, 'padding': 1.5rem,  'padding-text': 0.75rem, 'icon': 1.125rem, 'label-role': 'label', 'label-size': 'large'),
  'lg': ('height': 3rem,   'padding': 1.75rem, 'padding-text': 1rem,    'icon': 1.25rem,  'label-role': 'label', 'label-size': 'large'),
  'xl': ('height': 3.5rem, 'padding': 2rem,    'padding-text': 1.25rem, 'icon': 1.5rem,   'label-role': 'title', 'label-size': 'medium'),
) !default;
```

Pasangan `label-role`/`label-size` langsung dipakai mixin tipografi yang sudah ada:
`@include a.typography(map.get($wui-props, 'label-role'), map.get($wui-props, 'label-size'));`

### 4.2 Token disabled & elevasi

```scss
// tokens
$wui-disabled-container-opacity: 0.12 !default;
$wui-disabled-content-opacity: 0.38 !default;
$wui-elevation-1: 0 1px 2px rgb(0 0 0 / 30%), 0 1px 3px 1px rgb(0 0 0 / 15%) !default;
```

```scss
// themes/_light-theme.scss (grup "tidak bergantung mode")
// Diturunkan dari --wui-color-text, jadi satu definisi bekerja untuk mode terang & gelap.
--wui-color-disabled-container: color-mix(in srgb, var(--wui-color-text) 12%, transparent);
--wui-color-disabled-content: color-mix(in srgb, var(--wui-color-text) 38%, transparent);
--wui-elevation-1: #{$wui-elevation-1};
```

### 4.3 Perluasan `interactive-state()` (`abstracts/_mixins.scss`)

```scss
/// @param {String} $wui-role - peran state layer ('primary' | 'on-primary')
/// @param {String|null} $wui-surface - warna dasar; bila diisi, lapisan dicampur dengan
///   permukaan itu (untuk tombol filled). Bila kosong: lapisan transparan (outlined/text).
@mixin interactive-state($wui-role: 'primary', $wui-surface: null) { … }
```
Tanpa `$surface` → output sama seperti sekarang, jadi komponen lain tidak terpengaruh.

### 4.4 `scss/components/_button.scss`

```scss
@mixin button {
  .wui-button {
    // reset lokal (tidak di base/_reset agar tombol lain di aplikasi tidak ikut berubah)
    appearance: none;
    border: 0;
    font: inherit;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--wui-space-2);
    height: var(--wui-button-height);
    padding-inline: var(--wui-button-padding);
    border-radius: 9999px;
    white-space: nowrap;
    transition: background-color …, box-shadow …;

    &:focus-visible { … cincin sesuai B6 … }
    &:disabled { /* warna disabled + cursor default */ }

    @include a.interactive-state('on-primary', var(--wui-color-primary));   // filled (default)
  }

  @each $wui-size, $wui-props in a.$wui-button-sizes {
    .wui-button--#{$wui-size} {
      --wui-button-height: …;
      --wui-button-padding: …;
      --wui-button-icon-size: …;
      /* tipografi label dari map */
    }
  }

  // Varian
  .wui-button--outlined { /* border + label primary + interactive-state('primary') */ }
  .wui-button--text { /* tanpa border + padding-text + interactive-state('primary') */ }
}
```
Semua ukuran lewat CSS variable `--wui-button-*` supaya aplikasi bisa menyesuaikan per pemakaian
(`style="--wui-button-height: 3.25rem"`) tanpa menulis ulang style.

### 4.5 Komponen Angular (`projects/wui/src/button/button.ts`)

```ts
@Directive({
  selector: '[wuiButton]',
  host: {
    class: 'wui-button',
    '[class.wui-button--filled]': "variant() === 'filled'",
    '[class.wui-button--outlined]': "variant() === 'outlined'",
    '[class.wui-button--text]': "variant() === 'text'",
    '[class.wui-button--sm]': "size() === 'sm'",
    // … md/lg/xl
  },
})
export class WuiButton {
  readonly variant = input<'filled' | 'outlined' | 'text'>('filled');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
}
```
Diekspor dari `public-api.ts`. Contoh pemakaian:

```html
<button wuiButton>Filled (default)</button>
<button wuiButton variant="outlined" size="lg">Outlined</button>
<button wuiButton variant="text" size="sm">Text</button>
<button wuiButton disabled>Tidak aktif</button>
```

---

## 5. Struktur file (target)

| File | Perubahan |
| --- | --- |
| `abstracts/_tokens.scss` | Seksi `── Button (M3) ──`: `$wui-button-sizes`, `$wui-disabled-*-opacity`, `$wui-elevation-1` |
| `abstracts/_mixins.scss` | `interactive-state()` dapat `$wui-surface` (B8) |
| `themes/_light-theme.scss` | Emit `--wui-color-disabled-*` + `--wui-elevation-1` (grup tak bergantung mode) |
| `components/_button.scss` | **baru** — `@mixin button` (§4.4) |
| `components/_index.scss` | `@forward 'button';` |
| `scss/wui.scss` | `@include components.button;` (sebelum `utilities`) |
| `projects/wui/src/button/button.ts` | ✅ **selesai** — directive `[wuiButton]` |
| `public-api.ts` | ✅ **selesai** — ekspor `./button/button` + `./button/button.options` |
| `src/app/pages/button.page/**` | **baru** — halaman demo: matriks varian × ukuran × state (pakai `.is-hover`/`.is-pressed`), termasuk baris disabled |
| `src/app/app.routes.ts` | rute `/button` |
| `projects/wui/README.md` | Bagian tombol: daftar varian/ukuran + contoh pemakaian |

---

## 6. Fase kerja

| Fase | Isi | Keluaran | Status |
| --- | --- | --- | --- |
| **G1** | ✅ **selesai** — token `$wui-button-sizes`/radius/disabled/elevasi, `interactive-state($surface)` + hover dalam `@media (hover: hover)`, `components/_button.scss` (3 varian × 4 ukuran × 5 state) | Tombol bisa dipakai lewat class `.wui-button--*` | ✅ |
| **G2** | ✅ **directive selesai** — `WuiButton` (`[wuiButton]`, input `variant` & `size`, host class binding) + `button.options.ts` + ekspor `public-api`; ✅ class QA `.is-hover`/`.is-pressed`. **Belum**: rute & halaman demo | Tombol dipakai dengan `<button wuiButton …>`; penilaian visual menyusul | 🟡 sebagian |
| **G3** | Dukungan ikon (leading/trailing, padding asimetris 12/16 ala M3, ikon-saja dengan target 48dp) | Tombol ikon & tombol ikon-saja | ⬜ belum |
| **G4** | Shape `square` + morph saat pressed (`8/8/12/16`), varian `elevated`/`tonal` bila diperlukan | Kelengkapan M3 | ⬜ belum |
| **G5** | Dokumentasi README + catatan keputusan di dokumen ini | Panduan konsumen | ⬜ belum |

**Catatan hasil G1** — terverifikasi: lint hijau, `ng build wui` + `ng build --configuration development` sukses.

- Tinggi tombol ter-emit 32/40/48/56px; tipografi label mengikuti map (`label-large` untuk md, `title-medium` untuk xl).
- State layer `filled` memakai komposit: `color-mix(in srgb, var(--wui-color-on-primary) 8%, var(--wui-color-primary))`
  (tanpa menimpa warna dasar), sedangkan `outlined`/`text` memakai lapisan transparan.
- Token baru ter-emit: `--wui-color-disabled-container` (12%) & `--wui-color-disabled-content` (38%)
  dan `--wui-elevation-1`.
- **Temuan 1 (cascade)**: elemen tombol selalu membawa `.wui-button` (latar filled), sehingga varian
  `--outlined`/`--text` **wajib** menulis `background-color: transparent` — tanpa itu latar filled bocor.
- **Temuan 2 (format CSS)**: `#{0.1 * 100}%` di dalam fungsi bisa terserialisasi sebagai `10 %`
  (spasi sebelum `%`) → **tidak valid** dan deklarasinya dibuang browser (state pressed mati).
  Solusi: pakai aritmetika `* 100%` sehingga keluar `10%`.
- **Revisi B6**: cincin fokus memakai `a.focus-ring` (primary) untuk semua varian.
- **B8 ✅**: `interactive-state()` kini punya `$wui-surface` dan hover-nya dibungkus `@media (hover: hover)`;
  tanpa argumen baru perilakunya sama seperti sebelumnya.

**Catatan hasil G2 (directive)** — `ng build wui` + `ng build --configuration development` sukses.

- `projects/wui/src/button/button.ts`: `WuiButton` dengan `selector: '[wuiButton]'`, host class binding
  (`class: 'wui-button'` statis + toggle `[class.wui-button--<varian>]` / `--<ukuran>`), input signal
  `variant` (default `filled`) dan `size` (default `md`).
- `projects/wui/src/button/button.options.ts`: tipe `WuiButtonVariant` & `WuiButtonSize` — ikut ter-emit
  ke `dist/@wajek/wui/index.d.ts` sehingga konsumen bisa mengimpor tipenya.
- Class QA `.is-hover`/`.is-pressed` ter-emit untuk ketiga varian; `filled.is-hover` juga menambah
  `--wui-elevation-1` supaya pratinjau hover lengkap.

---

## 7. Verifikasi

```sh
docker exec -w /workspace wui_angular_dev sh -c "npm run lint:styles"
docker exec -w /workspace wui_angular_dev sh -c "npx ng build wui && npx ng build --configuration development"
docker exec -w /workspace wui_angular_dev sh -c "grep -o -- '--wui-button-[a-z-]*:[^;]*' www/styles.css | sort -u"
docker exec -w /workspace wui_angular_dev sh -c "grep -o -- '--wui-color-disabled-[a-z-]*:[^;]*' www/styles.css | sort -u"
```

| Cek | Ekspektasi |
| --- | --- |
| Varian | 3 class varian ter-emit; `filled` memakai `--wui-color-primary`, `outlined`/`text` label primary |
| Ukuran | `--wui-button-height` bernilai 32/40/48/56px untuk sm/md/lg/xl |
| Hover/pressed | komposit `color-mix(... on-primary 8%, var(--wui-color-primary))` untuk filled; lapisan transparan untuk outlined/text |
| Disabled | `--wui-color-disabled-container` 12% & `--wui-color-disabled-content` 38% ter-emit sekali untuk dua mode |
| Focus | hanya `:focus-visible` yang memunculkan cincin (bukan `:focus`) |
| Halaman demo | matriks 3 × 4 × 5 tampil benar di mode terang & gelap |

---

## 8. Risiko & jebakan

| Risiko | Detail | Mitigasi |
| --- | --- | --- |
| Cincin fokus tak terlihat di tombol `filled` | Warna cincin default (primary) menyatu dengan container primary | B6: warna cincin mengikuti varian; uji kontras di halaman demo |
| Hover "lengket" di perangkat sentuh | `:hover` tetap aktif setelah tap di sebagian browser | ✅ Ditangani: `interactive-state()` membungkus aturan hover dengan `@media (hover: hover)` (G1) |
| Format persen di `color-mix` | `#{0.1 * 100}%` bisa keluar sebagai `10 %` (spasi) → deklarasi tidak valid & dibuang, state pressed mati | ✅ Ditangani: pakai `* 100%` di fungsi `state-layer()` (G1, terbukti di CSS hasil build) |
| Latar varian bocor | Elemen tombol selalu punya `.wui-button` (filled), jadi varian lain mewarisi latar primary | ✅ Ditangani: `--outlined`/`--text` menulis `background-color: transparent` (G1) |
| Layer menimpa warna dasar | Pendekatan `background-color: <state layer>` akan menghapus warna primary tombol filled | B7/B8: pakai komposit `color-mix`, bukan overlay |
| Kontras disabled | 38% di atas latar mungkin sulit dibaca | Angka mengikuti M3; bila ada keluhan aksesibilitas, naikkan lewat token (satu tempat) |
| Reset tombol bocor | Menulis reset global di `base/_reset.scss` mengubah semua tombol aplikasi | Reset ditulis lokal di `.wui-button` |
| Target sentuh kecil | `sm` (32px) dan tombol ikon-saja bisa di bawah 48dp | B12 tanpa `min-width`; target 48dp ditangani di Fase 3 (padding/`::before` area) |
| `font: inherit` vs tipografi token | Tombol di dalam konteks bertipografi besar bisa mewarisi ukuran salah | Ukuran label selalu di-set dari map, `line-height` dari token tipografi |
| `white-space: nowrap` + teks panjang | Tombol bisa meluber di layar sempit | Dokumentasikan pemakaian label pendek; alternatif `min-width: 0` + `text-overflow` bila nanti perlu |
| Token baru vs mode gelap | Warna disabled memakai `color-mix` dari `--wui-color-text` | Satu definisi di `:root`; verifikasi di demo mode gelap |

---

## 9. Yang saya butuhkan dari Anda

1. **Angka ukuran** (§2.2) — pakai usulan di atas, atau ikut Figma `wui/*` Anda? Kalau Figma punya tabelnya, kirim tingginya saja dan saya sesuaikan map-nya.
2. **B2** — `md` = 40px (default M3) atau 48px?
3. **B1** — setuju `[wuiButton]` pada `<button>` native (bukan elemen `<wui-button>`)?
4. **B5/B6** — elevasi saat hover di `filled`, dan cincin fokus berwarna `text` untuk `filled`: setuju?
5. **B9** — boleh saya tambahkan class QA `.is-hover`/`.is-pressed` untuk halaman demo?
6. **B13** — teks tombol `nowrap` (tidak membungkus) setuju?
