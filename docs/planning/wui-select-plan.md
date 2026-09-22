# Planning — `wui-select` + `wui-option` (select Material 3 di dalam `wui-form-field`)

> Tujuan: kontrol **select** milik `@wajek/wui` sebagai anggota keluarga `wui-form-field`: wrapper
> tetap `<wui-form-field>` yang sudah ada, kontrolnya `<wui-select>` yang ditandai directive
> `wuiInput`, opsinya komponen `<wui-option>`, dan panel pilihannya dirender lewat
> **`@angular/cdk/overlay`** (bukan `<select>` native).

Status: **F0 ✅ selesai** (hasil pengukuran di §9) · **F1 ✅ dikerjakan** · **F2 ⛔ dikembalikan 22 Sep
2026** (halaman beku saat select diklik — lihat catatan di bawah). Keputusan terkunci: **L1–L10**
(L10 = revisi K4, disetujui 22 Sep 2026). **L11 tidak diperlukan** (terukur: fokus tidak direbut) —
disimpan sebagai jalur cadangan. Semua pengetesan/pengukuran lain **dilakukan manual oleh user**
(`AGENTS.md` §1); dokumen ini hanya memuat daftar periksa.

> ⛔ **F2 dikembalikan (22 Sep 2026).** Implementasi panel + `<wui-option>` + key manager **dibatalkan**
> dari working tree karena gejalanya: **halaman membeku (main thread terkunci) begitu select diklik** —
> bukan lambat, tapi hang, dan browser yang dipakai user ikut beku. Yang tetap berlaku: seluruh isi
> rencana di bawah (keputusan L1–L10, §3.2–§3.5, §4) — itu bukan penyebabnya, karena hang muncul saat
> panel **pertama kali dibuka**. Salinan berkas F2 ada di `/tmp/wui-f2-backup/` (host) untuk dipasang
> kembali setelah penyebabnya ketemu. Langkah berikutnya: **kembalikan F2 sepotong-sepotong** (panel
> polos dulu tanpa key manager, tanpa `scrollIntoView`, tanpa efek penanda) sampai bagian yang
> membekukan ketemu — jangan dikembalikan sekaligus.

Prefix keputusan **L** (dari se**L**ect). Jangan dicampur dengan `K` (`wui-form-controls-plan.md`),
`C`/`S` (plan warna lama), atau `M` (`wui-color-mtb-plan.md`).

| Dokumen | Hubungan |
| --- | --- |
| `docs/planning/wui-form-controls-plan.md` | **Induk plan ini** (K1–K7 diwarisi, tidak dibahas ulang — kecuali K4 yang direvisi lewat L10) |
| `docs/panduan-komponen.md` §"Form field" | Wiring a11y field: id ↔ `for`, `aria-describedby`, `aria-invalid` + jebakan terukur |
| `docs/panduan-warna.md` | Peran warna panel/opsi (`surface-container-*`, `on-surface`, `on-surface-variant`, `outline-variant`, `primary`, state layer) |
| `docs/planning/wui-dialog-plan.md` | Pola `cdk/overlay` + dua aturan kemenangan CSS (layer `z-index`, specificity `.cdk-overlay-pane.wui-*`) |

---

## 0. Jawaban singkat

**Bisa, tanpa dependency baru.** `@angular/cdk@^20.2.14` sudah jadi `dependencies` library; yang
bertambah hanya **pemakaian entry point** `cdk/overlay` (sudah dipakai dialog) dan `cdk/a11y`
(sudah dipakai page stack).

Bentuk akhirnya — **persis seperti yang Anda tulis**, dengan `wuiInput` sebagai penanda sekaligus
wiring ke field:

```html
<wui-form-field hint="Bisa dipilih hanya dengan keyboard.">
  <label wuiLabel>Kota</label>

  <wui-select wuiInput placeholder="Pilih kota" formControlName="kota">
    <wui-option value="jkt">Jakarta</wui-option>
    <wui-option value="bdg">Bandung</wui-option>
    <wui-option value="sby" disabled>Surabaya</wui-option>
  </wui-select>
</wui-form-field>
```

Poin kuncinya: **host `<wui-select>` itu sendiri yang menjadi elemen combobox** (`role="combobox"`,
fokusable, ber-`id`), jadi `wuiInput` cukup menulis `id`/`aria-describedby`/`aria-invalid` di sana —
sama seperti yang sudah dilakukannya untuk `<input>`. Akibatnya rantai visual pun gratis: directive
itu sudah memasang class `.wui-input` di host, sehingga tinggi 56px, border via
`--wui-field-border-color`, offset padding saat fokus, varian `outlined`/`filled`, dan keadaan
`[aria-invalid]` **tidak perlu ditulis ulang** di `_select.scss`.

---

## 1. Yang diwarisi dari plan form controls (jangan dibuka lagi)

| Keputusan | Isi | Efek |
| --- | --- | --- |
| K1 | CVA + tetap punya `input()`/`output()` | `WuiSelect` wajib CVA (`NG_VALUE_ACCESSOR` + `forwardRef`) |
| K2 | Native-first, **kecuali** select/combobox/kalender | `WuiSelect` = komponen — penyimpangan yang sengaja |
| K3 | `<wui-form-field>` + label diproyeksi (`<label wuiLabel>`) | Dipertahankan apa adanya |
| K4 | Select **custom sejak awal**, `<select>` native tidak dipakai | Dipertahankan; **bagian "`CdkListbox`" direvisi 22 Sep 2026** (L10 = b): `cdk/overlay` tetap, navigasi pakai `ActiveDescendantKeyManager` + markup listbox sendiri |
| K5 | Teks pesan error milik aplikasi | Library tidak menyediakan string berbahasa tertentu → dipakai juga untuk teks "tidak ada opsi" (L9) |
| K6 | State `invalid` dari `NgControl` opsional + input eksplisit | `aria-invalid` tetap ditulis field lewat `wuiInput`; `WuiSelect` menambah jalur `NgControl` untuk CVA |
| K7 | Tetap CDK, tidak ikut `@angular/material` | Panel & item ditata sendiri dengan token `--wui-*` |

---

## 2. Fakta CDK (dibaca langsung dari `node_modules/@angular/cdk` versi repo)

| Yang dicari | Berkas | Hasil |
| --- | --- | --- |
| `Overlay`, `OverlayConfig`, `OverlayRef` | `cdk/overlay/index.d.ts` | Ada. Plus `OverlayPositionBuilder.flexibleConnectedTo()`, `ScrollStrategyOptions.reposition()`, `OverlayOutsideClickDispatcher` |
| Strategi posisi | `cdk/overlay-module.d.d.ts` | `FlexibleConnectedPositionStrategy` punya `withPositions`, `withViewportMargin`, `withFlexibleDimensions`, `withGrowAfterOpen`, `withPush`, `withLockedPosition`; preset **`STANDARD_DROPDOWN_BELOW_POSITIONS`**, `STANDARD_DROPDOWN_ADJACENT_POSITIONS` |
| Key manager biasa | `cdk/list-key-manager.d.d.ts` | `withTypeAhead(debounce)`, `withWrap`, `withHomeAndEnd`, `skipPredicate`, `setActiveItem`, `activeItem`, `updateActiveItem`, `tabOut` |
| Key manager active-descendant | `cdk/activedescendant-key-manager.d.d.ts` | `ActiveDescendantKeyManager<T> extends ListKeyManager<Highlightable & T>`; `Highlightable` = `ListKeyManagerOption` + **`setActiveStyles()` dan `setInactiveStyles()`** — dan implementasinya **memanggil keduanya** (yang lama di-`setInactiveStyles()`, yang baru di-`setActiveStyles()`, lihat `fesm2022/activedescendant-key-manager.mjs:4-11`). Jadi opsi cukup menyalakan/mematikan class `.is-active` sendiri. `ListKeyManagerOption` juga menuntut `getLabel()` dan properti **`disabled` bertipe boolean biasa** — bukan signal (diperhatikan saat memberi nama input `WuiOption`) |
| `CdkListbox` / `CdkOption` | `cdk/listbox/index.d.ts` | Ada, termasuk **`useActiveDescendant`** (*"use active descendant or move focus onto the options"*), `multiple`, `compareWith`, `navigateDisabledOptions`. **Tidak dipakai** (L10 = b, 22 Sep 2026) — dicatat hanya sebagai pembanding |
| Focus trap di overlay | — | Overlay tidak menyediakan trap: bagus (tak ada trap kedua), tapi jadi sumber risiko #1 (§8) |
| Structural CSS overlay | `cdk/overlay-prebuilt.css` ada, tapi | CDK menyuntikkan CSS-nya sendiri saat runtime (`cdk-overlay-style-loader`) → tidak perlu impor CSS (sudah terbukti di dialog) |

Tiga jebakan repo yang **langsung berlaku** di panel select:

1. `z-index` CDK dibungkus `@layer cdk-overlay` → rule di luar layer selalu menang, penimpaan cukup biasa.
2. Properti lain (mis. `max-width` `.cdk-overlay-pane`) ada **di luar** layer dan stylesheet CDK datang
   **setelah** milik kita → wajib naik specificity: `.cdk-overlay-pane.wui-select-panel`.
3. Sass `@angular/build` tidak me-resolve `node_modules` → jangan `@use '@angular/cdk/…'`; semua style
   panel di `scss/components/_select.scss` kita.

Catatan pencarian berkas (bikin hemat waktu): tipe CDK berbentuk **bundel** —
`node_modules/@angular/cdk/overlay-module.d.d.ts` (dobel `.d`), bukan satu berkas per kelas.

---

## 3. Arsitektur

### 3.1 Berkas

| Berkas | Isi |
| --- | --- |
| `src/select/select.ts` | komponen `WuiSelect` (CVA, host combobox, overlay, keyboard) |
| `src/select/option.ts` | komponen `WuiOption` (`value`, `disabled`, label dari teks/`typeaheadLabel`, implementasi `Highlightable` → `setActiveStyles()` menyalakan class `.is-active`) |
| `src/select/empty.ts` | directive `[wuiSelectEmpty]` — isi yang tampil saat tidak ada opsi (L9) |
| `src/form-field/field-control.ts` *(L8)* | helper wiring bersama: atribut id/`aria-describedby`/`aria-invalid` beserta pemulihannya. **Pemakainya `WuiInput`** — `WuiSelect` tidak memanggilnya, justru karena wiring-nya memang dikerjakan `wuiInput` (L7); kalau nanti ada kontrol yang mengurus atributnya sendiri, helper ini sudah siap |
| `scss/components/_select.scss` | mixin `select` (host, panel, item) + `@include components.select;` di `wui.scss` |
| `src/app/pages/select.page/**` | halaman demo `/select` |
| `public-api.ts` | ekspor `WuiSelect`, `WuiOption`, `WuiSelectEmpty`, tipe |

### 3.2 DOM (host = combobox, tanpa tombol dalam)

```
wui-form-field                                  ← wrapper (label, hint/error, aria wiring)
└─ wui-select.wui-input                         ← ELEMEN YANG DIFOKUS
   role="combobox" tabindex="0" id="…"           ← id & aria-* dipasang `WuiInput` + field
   ├─ span.wui-select__value                    ← teks terpilih / placeholder
   ├─ wui-icon.wui-select__arrow                ← chevron (`aria-hidden`)
   └─ ng-content > [wuiSelectEmpty]             ← teks kosong (hanya saat tidak ada opsi)

panel (di .cdk-overlay-container, di body)
└─ div.wui-select__panel[role="listbox"][id]    ← `ng-content` opsi dipindahkan ke sini
   └─ wui-option[role="option"][id][aria-selected]  ← dari markup aplikasi
```

Panel **tidak difokuskan** (tanpa `tabindex`) — konsekuensi L3: satu-satunya elemen ter-fokus adalah
host. Panel hanya perlu bisa digulir (`max-height` + `overflow-y: auto`).

Aturan tampil placeholder — mengikuti kontrol native, jadi **placeholder baru tampil saat select
difokus**:

| Keadaan select | Yang tampil |
| --- | --- |
| Kosong, tidak difokus | hanya label, duduk di tengah kotak |
| Kosong, difokus | label mengapung ke garis atas **+ placeholder** di baris teks |
| Ada nilai | label mengapung + nilai terpilih |

Diterapkan dengan warna (`.wui-select__value--kosong { color: transparent }`, lalu `:focus`
mengembalikan `on-surface-variant`) — sama seperti `::placeholder` native di `_form-field.scss`, dan
lebar teksnya tetap terhitung sehingga kotak tidak berubah tinggi.

Konsekuensi yang harus ditangani karena host bukan elemen native:

| Perkara | Sebab | Penanganan |
| --- | --- | --- |
| Klik `<label>` tidak memfokuskan select | `for` hanya memfokuskan elemen *labelable* (button/input/select/textarea/…); elemen kustom bukan | `WuiFormField` menambah penanganan klik pada labelnya → panggil `focus()` kontrol (5 baris, terukur, tidak menyentuh perilaku `<input>`) |
| `.wui-input:disabled` tidak cocok | `:disabled` hanya untuk elemen native | `_select.scss` menata `wui-select[aria-disabled='true']` (atribut diset `setDisabledState()` CVA) memakai `--wui-color-disabled-*` |
| Perlu `display`/`cursor` sendiri | `.wui-input` tidak mengatur `display`/`cursor` | `_select.scss`: `display: inline-flex; align-items: center; justify-content: space-between; cursor: pointer; text-align: start` |
| Focus ring | `.wui-input { outline: none }` | Sudah tertutup: blok `:focus` `.wui-input` mengubah `--wui-field-border-color` → `primary` + border 2px (indikator terlihat di dua mode) |

### 3.3 Wiring ke `WuiFormField` lewat `wuiInput` (L7)

`WuiInput` diperluas: selector menjadi `input[wuiInput], textarea[wuiInput], wui-select[wuiInput]`,
dengan **satu** implementasi yang dipakai ketiganya (L8 — lihat §5). Perilaku yang dibedakan:

| Langkah | `input`/`textarea` | `wui-select` |
| --- | --- | --- |
| `class: 'wui-input'` di host | ✅ | ✅ (memberi seluruh tampilan field) |
| `placeholder=" "` otomatis | ✅ (dibutuhkan `:placeholder-shown`) | ❌ **dilewati** — select tidak punya `:placeholder-shown`; emtpy-state dihitung dari nilai |
| `id` dari field | ✅ | ✅ (target `for` label) |
| `aria-describedby` / `aria-invalid` | ✅ | ✅ |
| Penanda "sudah terisi" | implisit (`:placeholder-shown`) | `WuiSelect` memasang `data-filled` di host → `_form-field.scss` menambah satu `:has()` |

Dengan begitu **`wui-form-field` tidak perlu tahu** jenis kontrolnya: semua keadaan yang
mengapungkan label & mewarnai border tetap dibaca dari CSS + satu atribut data.

### 3.5 Navigasi (L10 = b — manager sendiri)

Yang dipakai dari CDK hanya **algoritma** navigasinya; markup & handler kita:

```ts
// konsep — bukan kode final
#manager = new ActiveDescendantKeyManager(this.#opsi())
  .withTypeAhead()
  .withWrap()
  .withHomeAndEnd()
  .skipPredicate((o) => o.disabled);

// host (keydown) → manager.setActiveItem(...) / manager.onKeydown(event)
// opsi aktif → manager.activeItem.id → host menulis aria-activedescendant
```

Konsekuensi yang harus diperhatikan saat menulis F2:

- `ActiveDescendantKeyManager.setActiveItem()` memanggil `setActiveStyles()` pada opsi → cukup class
  `.is-active` (satu baris di `_select.scss`), **tanpa** memindahkan fokus ke opsi.
- Daftar opsi di-refresh setiap kali `ng-content` berubah (`contentChildren` signal → re-`setActiveItem`),
  kalau tidak navigasi jadi basi setelah opsi ditambah/dihapus dinamis.
- `skipPredicate` harus membaca `WuiOption.disabled` **reaktif**, bukan nilai yang ditangkap sekali.
- `manager.onKeydown(event)` **tidak** menangani Enter/Space/Escape/Tab → tiga tombol itu kita urus
  sendiri di host (buka/pilih/tutup/`tabOut`), sesuai tabel §4.
- Arah panah mengikuti `Directionality` (di RTL, ArrowKanan = tombol berikutnya) dan scroll panel
  harus ikut menampilkan opsi aktif (`scrollIntoView({ block: 'nearest' })`).
- **Tidak ada** `SelectionModel`/CVA dari `CdkListbox` yang ikut terbawa — select punya CVA sendiri (K1).

Empat hal yang baru muncul saat F2 dikerjakan (dan wajib diingat saat mengubah panel):

- **Konten panel wajib `width: 100%`.** Pane overlay CDK adalah flex container, jadi blok seperti
  `.wui-select__panel` menyusut ke lebar padding-nya kalau tidak dipatok — terukur 48px di dalam pane
  315px, walau `updateSize({ width })` sudah benar. Lebar pane ≠ lebar isi panel.
- **Proyeksi `ng-content` bolak-balik.** Opsi hidup di projection slot; saat panel tertutup, node-nya
  kembali menjadi anak `<wui-select>` (begitulah cara kerja `ng-content`) — jadi wajib
  `.wui-select > wui-option { display: none }`, kalau tidak opsi tampil sebagai teks telanjang di
  dalam kotak field saat panel tertutup.
- **Escape harus `stopPropagation()`.** Listener dialog memakai keydown di tingkat dokumen; tanpa
  itu, menutup panel dengan Esc sekaligus menutup dialog yang membungkus select ini.
- **Penanda `.is-active` tidak ikut terhapus bersama manager-nya.** `setActiveItem()` hanya mencabut
  penanda item yang sedang dipegang manager itu; manager yang **dibuang** (panel ditutup) atau
  **diganti** (daftar opsi berubah) meninggalkan penanda terakhirnya. Akibatnya `.is-active`
  menumpuk jadi 2–3 opsi dari beberapa kali buka-tutup, dan sesudah itu tidak ada yang bisa
  mencabutnya lagi (manager baru tidak tahu opsi mana yang ditunjuk yang lama). Solusinya: penanda
  dicabut dari **semua** opsi (bukan dari `manager.activeItem`), di `tutup()` dan sebelum item awal
  ditunjuk.

### 3.4 Siklus hidup panel (penting)

- Panel dibangun **sekali** (saat pertama dibuka) lalu `attach`/`detach` — **jangan** hancur-bangun
  tiap buka, karena `ng-content` (opsi milik aplikasi) akan ikut hancur dan state pilihan hilang.
- `overlayRef.dispose()` hanya saat komponen dihancurkan (`DestroyRef`).

**Panel = dialog tanpa backdrop gelap** (revisi 22 Sep 2026, usul user):

- `hasBackdrop: true` + `backdropClass: 'cdk-overlay-transparent-backdrop'` (bawaan CDK: tak terlihat,
  tapi `pointer-events: auto` saat showing). Akibatnya interaksi dengan elemen di belakang panel
  berhenti, dan klik di mana pun di luar panel menutupnya lewat `backdropClick()` — jadi
  `outsidePointerEvents()` **tidak dipakai lagi** (begitu pula penjagaan "klik di host bukan klik luar").
- Aman terhadap tumpukan overlay karena CDK menyisipkan backdrop **sebelum** pane
  (`fesm2022/overlay-module.mjs:1145-1147`, dengan komentar "in order to handle stacked overlays
  properly") → pane tetap di atas backdrop-nya sendiri.
- gulir halaman dikunci `scrollStrategies.block()`, sama seperti dialog Material: CDK membuat `<html>`
  `position: fixed` + mempertahankan scrollbar. **Bukan** `overflow: hidden` yang ditulis sendiri —
  usulan awal agent itu ditolak user karena bukan cara CDK. Siklus hidup block mengikuti attach/detach:
  `_scrollStrategy.enable()` saat attach (`:911`), `disable()` saat detach (`:979`).

**Dua acuan yang dipisah** (koreksi user 22 Sep 2026):

- **Posisi** dari elemen `<wui-select>` (`#asal()`) → panel menempel tepat di bawah kontrolnya.
- **Lebar** dari elemen `<wui-form-field>` (`#lebarPanel()`) → sama dengan kotak field.
- Mengikat posisi ke field akan menaruh panel di bawah pesan hint/error, bukan di bawah kontrolnya.

**Ikut perubahan ukuran** (temuan user 22 Sep 2026):

- Lebar panel **dipatok sendiri** saat buka (`updateSize({ width })`), jadi angkanya basi begitu field
  berubah lebar: jendela di-resize, sidenav dilipat, kolom grid pindah breakpoint.
- Karena itu `ResizeObserver` (`box: 'border-box'`) dipasang pada elemen acuan selama panel terbuka,
  dan setiap perubahan menjalankan **lebar dulu, baru `updatePosition()`** — urutan ini penting, sebab
  lebar menentukan keputusan "di bawah atau di atas".
- Pembagian tugas dengan CDK: **posisi** sudah ikut resize viewport lewat
  `FlexibleConnectedPositionStrategy._resizeSubscription` → `ViewportRuler.change()` (`:1357`),
  tetapi CDK **tidak memakai `ResizeObserver`** sama sekali (0 kemunculan di `overlay-module.mjs`) →
  perubahan ukuran elemen tidak terdeteksi olehnya.
- Penyelarasan dipadatkan satu kali per frame (`requestAnimationFrame`) — sekaligus cara resmi
  menghindari "ResizeObserver loop completed with undelivered notifications".

**Posisi (resep terukur — lihat §9):** `overlay.position().flexibleConnectedTo(elemen select)` dengan
`.withPositions(STANDARD_DROPDOWN_BELOW_POSITIONS)`, `.withFlexibleDimensions(true)`,
`.withPush(false)`, `.withGrowAfterOpen(false)`, `.withViewportMargin(8)`.
**Jangan** menambahkan `STANDARD_DROPDOWN_ADJACENT_POSITIONS` pada select: terukur membuat panel
pindah ke **samping** trigger, bukan flip ke atas (dan preset `BELOW` sudah memuat dua posisi
"di atas", jadi flip ke atas itu bawaan).

**Celah yang belum ditutup**: gulir lewat keyboard (`PageUp`/`PageDown`) saat panel terbuka masih bisa
menggulir kontainer dalam, karena `block()` hanya membekukan dokumen dan yang digulir keyboard adalah
leluhur elemen yang fokus. Ditutup bersama F2c, saat tombol itu mulai dipakai untuk daftar opsi.

---

## 4. Kontrak a11y (target, bukan hasil ukur)

| Elemen | Atribut |
| --- | --- |
| `wui-select` (host) | `role="combobox"`, `tabindex="0"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` (id panel), `aria-activedescendant` (id opsi aktif), `aria-required`, `aria-disabled`, plus `id`/`aria-describedby`/`aria-invalid` dari `WuiInput` |
| nama aksesibel | dari `<label for>` milik field (jangan pasang `aria-label` sendiri; kalau aplikasi menulisnya, biarkan menang) |
| panel | `role="listbox"`, `id` |
| `wui-option` (host) | `role="option"`, `id`, `aria-selected`, `aria-disabled` |

`aria-activedescendant` **kita** yang memasang (dari `manager.activeItem.id`) — tidak mengandalkan
efek samping internal CDK. Saat panel tertutup, atribut itu **dikosongkan** (id yang menunjuk elemen
tak terlihat = pelanggaran aturan "referensi HARUS valid"); `aria-expanded="false"` yang menandai keadaan.

**Sudah diterapkan (22 Sep 2026, F2c)** — sama untuk `role="listbox"` + id panel di panelnya:

- tertutup: **Space**, **Enter**, **panah atas/bawah** membuka panel (Space ditahan `preventDefault()`
  supaya halaman tidak ikut menggulir);
- terbuka: **panah** memindahkan penunjuk (opsi nonaktif dilewati `skipPredicate`), **Home/End** ke
  ujung, **Enter/Space** memilih, **Esc** menutup tanpa mengubah nilai (`stopPropagation()` supaya
  dialog di atasnya tidak ikut tertutup), **Tab** menutup lalu lanjut pindah field;
- **PageUp/PageDown ditahan** — celah gulir keyboard di §3.4 ditutup di sini;
- opsi yang ditunjuk ditandai `.is-active` (`setActiveStyles()`/`setInactiveStyles()` dari CDK) dan
  panel menggulir **lewat `scrollTop` panel**, bukan `scrollIntoView()`.

Penanda `.is-active` itu **tepat satu** (dan nol saat panel tertutup). Itu bukan bawaan CDK:
`ActiveDescendantKeyManager` hanya mencabut penanda opsi yang **sedang** ia pegang, jadi begitu
manager-nya dibuang (panel ditutup) atau diganti yang baru, penanda item terakhirnya tertinggal dan
**menumpuk** — terukur di user: dua sampai tiga opsi tersorot setelah panel dibuka-tutup sambil
dinavigasi. Karena itu `WuiSelect` mencabut penandanya sendiri (`#bersihkanPenunjuk()`, dipanggil di
`tutup()` dan sebelum menunjuk item awal di `#siapkanManager()`).

**Belum**: `withTypeAhead()` (mengetik huruf untuk melompat — satu panggilan, tinggal diputuskan),
`withWrap()` (panah berputar di ujung), dan `aria-required` (F3).

| Tombol | Tertutup | Terbuka |
| --- | --- | --- |
| Enter / Space / Alt+↓ | buka panel | pilih opsi aktif → tutup (fokus tetap di host) |
| ↓ / ↑ | buka panel (M3) | pindah opsi aktif, **melewati** `disabled` (`skipPredicate`) |
| Home / End | — | opsi pertama / terakhir (`withHomeAndEnd`) |
| Escape | — | tutup tanpa mengubah nilai |
| Tab | pindah field (normal) | tutup panel, lalu lanjut tab |
| huruf | — | type-ahead (`withTypeAhead()`), label dari `typeaheadLabel` ?? teks opsi |

---

## 5. Keputusan yang terkunci

| # | Keputusan | Alasan |
| --- | --- | --- |
| **L1** | `wui-select` = **komponen** yang dipakai **di dalam** `<wui-form-field>` yang sudah ada; bentuk wrapper tidak diubah | Permintaan user (22 Sep 2026); satu jalur a11y: `for`/`aria-describedby`/`aria-invalid` tetap milik field |
| **L2** | Panel dirender lewat **`@angular/cdk/overlay`** | (a) pola yang sudah terbukti di dialog; (b) `position: absolute` akan terpotong `overflow`/`transform` induk dan tersandera stacking context page/dialog; (c) `<select>` native tidak bisa ditata jadi panel M3 |
| **L3** | Model fokus: **active descendant** — opsi ditunjuk `aria-activedescendant`, fokus tidak berpindah ke tiap opsi | Permintaan user; lebih sedikit elemen ter-fokus dan memperkecil peluang rebutan dengan focus trap (§8 risiko 1) |
| **L4** | Skema markup: `<wui-select>` dengan anak **`<wui-option>`** (komponen), bukan `[cdkOption]` di `<li>` | Permintaan user. Konsisten dengan gaya library lain (label/hint/error juga markup). `value` **opsional**: kalau tidak ditulis, nilainya = teks opsi (di-trim) |
| **L5** | `compareWith` untuk perbandingan nilai (default `Object.is`) | Permintaan user; syarat agar `formControlName` dengan nilai objek (hasil API) tidak "kehilangan" pilihan |
| **L6** | Dropdown biasa untuk semua ukuran layar; samping→bawah-sheet pada `pointer: coarse` dicatat sebagai fase terpisah | Permintaan user; menekan permukaan uji v1 |
| **L7** | **`wuiInput` dipakai pada `<wui-select>`** sebagai penanda + wiring ke field (host = elemen combobox yang difokus) | Permintaan user; dampak bagusnya: class `.wui-input` otomatis memberi seluruh tampilan field, dan `WuiFormField` tidak perlu tahu jenis kontrol |
| **L8** | Logika wiring (`#set`/`#kembalikan`/`#setDescribedBy`) **diangkat jadi satu helper bersama** `src/form-field/field-control.ts` (`FieldControl`) | Usul agent (diminta user). Menghindari dua salinan ~80 baris logika atribut. **Catatan setelah F1**: karena `wuiInput` memang satu-satunya pemilik wiring (L7), helper ini sekarang dipakai `WuiInput` saja — jadi nilainya adalah `input.ts` tetap kecil & atributnya terpulihkan lewat satu jalur, bukan menghindari duplikasi yang ternyata tidak terjadi. Risikonya tetap: menyentuh `WuiInput` → ada daftar periksa regresi input di §11 |
| **L9** | `required` hanya diteruskan jadi `aria-required="true"` (tanpa tanda bintang dari library), dan teks "tidak ada opsi" disediakan aplikasi lewat `<span wuiSelectEmpty>…</span>` | Usul agent (diminta user). Konsisten dengan K5: library tidak berbahasa tertentu, tapi aplikasi tetap punya tempat menaruh teksnya |
| **L10** | Navigasi/keyboard: **`ActiveDescendantKeyManager` + `ListKeyManager` dari `cdk/a11y`, markup listbox kita sendiri** — `CdkListbox` tidak dipakai. **Ini revisi K4** (bagian "`CdkListbox`") | Disetujui user 22 Sep 2026 ("jalankan usul b") setelah usul agent §6. Tiga alasan: (1) opsi kita komponen `<wui-option>` (L4), bukan `[cdkOption]` di `<li>` — `CdkListbox` menuntut opsi kita mem-`hostDirectives` `CdkOption`; (2) L3 menuntut fokus tetap di host, sedangkan `CdkListbox` mengasumsikan fokus masuk ke elemen listbox; (3) `CdkListbox` membawa CVA + `SelectionModel` yang tidak dipakai (select punya CVA sendiri, K1). Algoritma navigasi tetap milik CDK: `withTypeAhead`/`withWrap`/`withHomeAndEnd`/`skipPredicate` (§3.5) |

> **Catatan revisi (22 Sep 2026)** — **K4** di `docs/planning/wui-form-controls-plan.md` yang semula
> berbunyi "`cdk/overlay` + **`CdkListbox`**" kini: `cdk/overlay` **tetap**, `CdkListbox` → manager
> sendiri (L10). Dua bagian K4 yang tidak berubah: "select custom sejak awal" dan "`<select>` native
> tidak dipakai sebagai tahap awal". Penanda revisi juga sudah dipasang di plan induk.

---

## 6. Yang masih terbuka

| # | Pertanyaan | Status |
| --- | --- | --- |
| **L11** | Mitigasi bila trap page/dialog berebut fokus | **Tidak diperlukan** — F0 mengukur fokus tidak pernah direbut (§9 baris 2). Kalau F2 memunculkannya lagi, urutan yang dipakai: (a) fokus tetap di host → (b) koordinasikan trap dengan `WuiPageService`/`WuiDialogService` → (c) render panel di dalam subtree page |

L10 (navigasi) **sudah diputuskan** — lihat §5. Tidak ada butir lain yang menunggu keputusan selain
angka desain panel (§8 no. 14).

---

## 7. Rencana fase

| Fase | Isi | DoD |
| --- | --- | --- |
| **F0** ✅ | **Spike pengukuran** — harness di `src/app/pages/select-spike/**` (rute `/select-spike`), gaya lokal `spike-*` | **Selesai 22 Sep 2026** — hasil di §9. Harness sengaja **kode sekali pakai**: setelah F2 (panel asli jalan) rute + folder itu dihapus |
| **F1** ✅ | Host combobox + `wuiInput` (L7/L8): selector diperluas, helper bersama, klik label → fokus, `aria-disabled`, `data-filled`; `ng-content` opsi belum dirender ke panel | **Dikerjakan 22 Sep 2026** (masih berlaku). Berkas: `src/select/select.{ts,html}`, `src/form-field/field-control.ts` (baru), `input.ts` + `form-field.ts` (diubah), `scss/components/_select.scss` (baru) + `_form-field.scss`, token `$wui-select-arrow-size`. Demo `/select` di `src/app/pages/select/` |
| **F2a** ✅ | Panel kerangka: `cdk/overlay` + `TemplatePortal`, `flexibleConnectedTo` **elemen `<wui-select>`** (lebar dari `<wui-form-field>`) + `STANDARD_DROPDOWN_BELOW_POSITIONS` (bawah → atas), **backdrop transparan** + `scrollStrategies.block()`, **`ResizeObserver` untuk lebar + reposisi**, tanpa opsi/key manager/efek | **Terukur 22 Sep 2026**: **tidak beku** · pane 315×100 = lebar field 315 · `diBawah: true` saat ruang bawah cukup, di atas saat tidak · `zPane 1000` / `zContainer 1100` · `aria-expanded: true` · isi panel 48px → **diperbaiki** `width: 100%` (pane CDK itu flex container) → 315×100. Revisi 22 Sep 2026 (usul user): panel = **dialog tanpa backdrop gelap**, bukan penguncian `overflow: hidden` sendiri — lihat §3.4 |
| **F2b** ✅ | `ng-content` + `WuiOption` (tanpa keyboard) + penanda terpilih (`aria-selected`, label nilai) | **Dikerjakan 22 Sep 2026** — berkas: `src/select/option.ts` (baru: isi diproyeksikan, `role="option"`, `id` stabil, `aria-selected`/`aria-disabled`, `value` opsional = teks, **`typeaheadLabel`**), `select.ts` (`contentChildren`, `compareWith`, `valueChange`, `klikPanel()`, `#tandaiTerpilih()` **tanpa `effect()`**), `_select.scss` (gaya `.wui-option` + `max-height` panel + `.wui-select > wui-option { display: none }`), token `$wui-select-{option-height,panel-max-height}`, demo bagian 4 (opsi berikon + dua baris). Pilihan sadar: penanda terpilih disegarkan **saat panel dibuka & setelah memilih**, bukan lewat `effect()` latar — salah satu tersangka hang F2 lama |
| **F2c** ✅ | `ActiveDescendantKeyManager` + keyboard penuh + `aria-activedescendant` + `role="listbox"`/`aria-controls` | **Dikerjakan 22 Sep 2026**: Space/Enter/panah membuka; panah + Home/End memindahkan penunjuk; Enter/Space memilih; Esc/Tab menutup; PageUp/PageDown ditahan; `aria-activedescendant` + `role="listbox"` terpasang; key manager dibuat **saat panel dibuka** (tanpa `effect()`), penunjuk digulirkan lewat `scrollTop` panel. Sisa: type-ahead & wrap (lihat §4) |
| **F2d** | Gulir opsi aktif (lewat `scrollTop` panel, **bukan** `scrollIntoView`), `updateSize` lebar, `[wuiSelectEmpty]` | — |
| ~~F2~~ ⛔ | (versi lama, sekaligus) | Dikembalikan 22 Sep 2026 — halaman beku saat select diklik. Salinan di `/tmp/wui-f2-backup/`. **Tidak beku dengan F2a**, jadi penyebabnya ada di bagian yang dibuang: `WuiOption`/key manager/efek penanda — itu yang akan diisolasi F2b & F2c |
| **F3** | CVA + `compareWith` (L5) + `disabled` (field & `NgControl`) + `required` (L9) | `formControlName`, `ngModel`, dan mode tanpa forms (`[value]`/`(valueChange)`) semuanya bekerja |
| **F4** | Demo `/select` + dokumentasi (`docs/panduan-komponen.md`, `projects/wui/README.md`) | Demo memuat: dasar, `outlined`/`filled`, disabled, invalid, objek + `compareWith`, di dalam dialog, walkthrough keyboard-only |
| **F5** | Gaya M3 + token `$wui-select-*` (panel/item/max-height) + **`$wui-z-select-panel`** | Terukur di `wui.local`, terang & gelap |
| **F6** | `multiple` + chips trigger, lalu filter/combobox (= F4 di plan induk) | — |

---

## 8. Risiko & jebakan

1. **Focus trap page/dialog vs panel di `body`** — **terukur TIDAK terjadi** (§9 baris 2): panel dibuka
   dari dalam lapisan page yang trap-nya menyala, fokus tetap di trigger (sebelum, sesudah, dan +250ms),
   dan panel tetap menerima klik. Dua sebabnya: L10 = (b) membuat fokus tidak pernah meninggalkan host,
   dan panel hidup di `document.body` (di luar subtree kurungan `aria-hidden`). Tetap dicatat sebagai
   risiko yang bisa muncul kembali kalau F2 menambah `focus()` atau menuang fokus ke panel.
2. **`z-index`** — **terukur tidak butuh token sendiri** (§9 baris 3–4): dialog menaruh
   `--wui-z-dialog` (1100) di **`.cdk-overlay-container`**, sedangkan pane dialog tetap `z: 1000`.
   Panel select dibuat **belakangan** di container yang sama → menang lewat **urutan DOM**, dan
   `hit-tengah` = PANEL baik dengan maupun tanpa `z-index` di pane. Usulan `$wui-z-select-panel: 1200`
   **dicabut**; yang wajib hanya menjaga agar pane dibuat setelah dialog ada (otomatis, karena
   overlay select dibuat saat komponennya hidup di dalam dialog).
3. **Panel terpotong** — selalu render via overlay ke `body`.
4. **`ng-content` + overlay** — portal dibuat **sekali**, `detach`/`attach` (bukan hancur-bangun).
   Salah di sini = opsi ikut hancur / nilai ter-reset tiap buka.
5. **Klik label tidak memfokuskan** — hanya muncul karena host bukan elemen native (L4/L7 pilihan kita);
   ditangani di `WuiFormField`, dan **wajib** diuji dengan klik mouse asli (bukan `label.click()` JS).
   Catatan 22 Sep 2026: label kini `pointer-events: none` (supaya klik tidak tertelan label yang
   menutupi kontrol), jadi jalur fokusnya sepenuhnya lewat host listener `WuiFormField`.
6. **`:disabled` tidak berlaku** — pakai `[aria-disabled='true']` untuk penataan; jangan lupa
   `pointer-events`/`cursor` agar tidak terasa "aktif" padahal disabled.
7. **Zoneless** — semua perubahan state panel/opsi lewat signal/`Subject` + CVA memanggil
   `onChange`/`onTouched`.
8. **SSR/prerender** — overlay hanya dibuat saat interaksi; jangan menyentuh `document` saat render.
9. **Dist & tipe** — playground membaca tipe `@wajek/wui` dari `dist` → `npm run build:wui` wajib
   sebelum `ng build`/editor hijau setelah komponen baru diekspor.
10. **Jebakan lint yang sudah kena** — `declaration-empty-line-before` (deklarasi tak boleh menempel di
    bawah custom property/`@include`), komentar `//` kosong ditolak, `$wui-*` untuk **semua** variabel
    lokal, `max-nesting-depth: 3`.
11. **`selector-class-pattern`** hanya menerima `wui-*`, `.is-*`, `.cdk-*` → aman untuk
    `wui-select__panel`/`wui-option`, tapi jangan membuat class seperti `.option-item`.
12. **RTL** — logical property + kirim `direction` ke `OverlayConfig` supaya `start`/`end` benar.
13. **Daftar panjang** — v1 memakai `max-height` + `overflow-y: auto`; ribuan opsi = `cdk/scrolling`
    (fase nanti, bukan v1).
14. **Angka desain belum ada** — tinggi item, padding panel, radius: token placeholder di
    `abstracts/_tokens.scss`, jangan disebar di komponen.

---

## 9. Hasil spike F0 ✅ (diukur 22 Sep 2026 di `wui.local/select-spike`)

Harness: `src/app/pages/select-spike/**` + rute `/select-spike` (kode sekali pakai). Diukur di
jendela 1424×700 (kasus 1–3) dan 1424×420 (kasus 4). Semua angka dari `getBoundingClientRect`,
`getComputedStyle`, dan `document.elementFromPoint`; `hit = PANEL` berarti titik itu benar-benar
menerima klik.

| Yang diukur | Hasil |
| --- | --- |
| Panel di dalam induk `overflow: hidden` | ✅ **Lolos, tidak terpotong.** Kotak 414,55 **837×80** sedangkan panel 423,104 **200×240** — 220px panel ada di luar garis bawah kotak, dan `hit-atas`/`hit-bawah` = **PANEL**. Pane hidup di `.cdk-overlay-container` (`di container CDK? true`), bukan di dalam kotak |
| Panel di dalam `<wui-page>` (trap aktif) | ✅ **Fokus tidak direbut.** Lapisan page kedua (`depth=2`) dengan trap menyala; fokus `button` **sebelum = sesudah = +250ms**, `hit-atas`/`hit-bawah` = PANEL. Panel (304,276 200×240) tetap bisa diklik dari dalam kurungan |
| Panel di dalam dialog | ✅ **Di atas dialog tanpa `z-index` tambahan.** `plain`: pane z=1000, pane dialog z=1000, `container z=1100`, wrapper pane select **indeks 2** vs dialog **1** dari 3 (0 = backdrop) → `hit-tengah` = PANEL. `z-index: 1200` di pane juga bekerja, tapi **tidak diperlukan** |
| Di mana `--wui-z-dialog` benar-benar dipasang | Pada **`.cdk-overlay-container`**, bukan pane (dikonfirmasi di `_dialog.scss` + terukur `container z=1100`, `pane z=1000`). Konsekuensinya: **semua** panel CDK ikut naik di atas page stack (`--wui-z-overlay: 1000`) |
| Ruang bawah jendela tidak cukup | ✅ **Resep:** `BELOW_POSITIONS` + `withFlexibleDimensions(true)` + `withPush(false)` → panel **flip ke atas** (bawah panel = atas trigger) **dan menyusut** mengikuti ruang (tinggi pane 214px, isi `clientHeight 212` vs `scrollHeight 304` → menggulir), `utuh di jendela? true`. Tanpa dimensi fleksibel: panel **keluar jendela** (atas −18). Dengan `ADJACENT` + push: panel pindah ke **samping** (737,22) — tidak diinginkan untuk select |

### 9.1 Temuan tambahan (langsung dipakai di F2)

1. **Geometri pane belum siap di tick yang sama dengan `attach()`** — terukur pane `0,0 1×1` dan isi
   `200×10` saat dibaca segera; +250ms baru benar (200×240). Jadi jangan menaruh logika yang membaca
   ukuran pane tepat setelah `attach()` (mis. menghitung ulang posisi) — tunggu frame berikutnya.
2. **Pola "pane dibuat sekali lalu `attach`/`detach`" bekerja** — semua kasus memakai satu `OverlayRef`
   per kunci yang dipakai ulang tanpa membangun ulang pane (opsi di §3.4 tidak perlu diragukan lagi).
3. **`STANDARD_DROPDOWN_BELOW_POSITIONS` isinya: bawah-start, atas-start, bawah-end, atas-end**
   (dibaca dari `node_modules/@angular/cdk/fesm2022/overlay-module.mjs:2264`). Jadi "flip ke atas"
   adalah perilaku bawaan preset itu; `ADJACENT_POSITIONS` menambahkan 4 posisi **samping**.
4. **Overlay tidak mencuri fokus saat dibuka** (kasus 2 & 3): `document.activeElement` tetap tombol
   pemicu. Artinya F2 tidak perlu mengembalikan fokus secara manual setelah membuka panel.

---

## 10. Alternatif yang ditolak

| Alternatif | Alasan ditolak |
| --- | --- |
| Styling `<select>` native (`appearance: none`) | popup native tidak bisa ditimpa → yang tampil di desktop daftar OS, bukan panel M3. Bertentangan dengan K4/L1 |
| Panel `position: absolute` di dalam field | terpotong `overflow`/`transform` induk dan tersandera stacking context page/dialog |
| Host wrapper + `<button>` di dalam sebagai combobox (agar `for` native bekerja) | butuh dua lapis wiring (`wuiInput` di host akan menulis atribut ke elemen yang salah) dan menambah satu elemen fokus; dipilih host-langsung karena `wuiInput` ditulis di host (L7/L4) + field kami sendiri bisa memfokuskan kontrol saat label diklik |
| Opsi sebagai directive `[cdkOption]` di `<li>` | user memilih komponen `<wui-option>` (L4); markup aplikasi jadi lebih ringkas dan bisa punya slot |
| `CdkListbox` sebagai **lapisan navigasi** (walau opsinya tetap komponen kita) | Ditolak 22 Sep 2026 (**L10 = b**): fokus harus tetap di host (L3) sedangkan `CdkListbox` mengasumsikan fokus masuk ke listbox; opsi kita harus mem-`hostDirectives` `CdkOption`; dan CVA + `SelectionModel` bawaannya tidak dipakai (K1). Yang **diadopsi** tetap kelas `ActiveDescendantKeyManager`/`ListKeyManager` dari `cdk/a11y` — algoritmanya, bukan komponennya |
| Menulis navigasi dari nol (tanpa CDK) | Type-ahead (termasuk timeout & duplikat huruf), wrap, Home/End, dan `skipPredicate` sudah ada & teruji di `cdk/a11y`; menulis ulang hanya menambah permukaan bug |
| Memakai `CdkConnectedOverlay` directive di template | siklus buka-tutup, `aria-controls`/`activedescendant`, dan scroll strategy lebih jelas dikelola imperatif (`Overlay` + `OverlayRef`) — sejalan dengan pilihan dialog |
| Menyatukan select + combobox sejak v1 | combobox menambah input teks + filter; select jauh lebih sederhana dan sudah menjadi F4 plan induk |
| `@angular/material` select | K7: dua sistem tema, bahasa visual Material bocor ke design system kita |
| Pustaka pihak ketiga (`ng-select`, `primeng`, …) | dependency baru + bahasa visual sendiri, padahal kebutuhan kita satu komponen |

---

## 11. Daftar periksa (manual, dijalankan user)

Saat fase dieksekusi — **agent tidak menjalankannya sendiri**:

- `npm run lint:styles` hijau (perhatikan `selector-class-pattern`, `declaration-empty-line-before`).
- `npm run build:wui` lalu `ng build` (build app sekaligus memeriksa tipe template demo).
- **Regresi input** (karena L8 menyentuh `WuiInput`): di `/form` ulangi yang sudah terukur dulu —
  `for` ↔ id 6/6, `aria-describedby` cocok, input 40px…(kini 56) / label mengapung outlined & filled /
  border fokus `primary` / invalid `error` / hover.
- Keyboard-only di `/select`: Tab ke select → Enter buka → panah (melewati opsi disabled) →
  Home/End → Enter pilih → Esc tutup; Tab saat panel terbuka **tidak** terperangkap.
- Esc di select **di dalam dialog** menutup panel saja, bukan dialognya.
- Panel selebar kotak select (option pendek tidak membuat panel menyusut).
- Saat panel tertutup, opsi **tidak** terlihat sebagai teks di dalam kotak field (§3.5).
- **Aktivasi (L10 = b)**: saat panel terbuka, `document.activeElement` tetap **host** `<wui-select>`
  (tidak pindah ke opsi/panel); tepat **satu** opsi ber-class `.is-active`; menulis huruf melakukan
  type-ahead; `aria-activedescendant` menunjuk id opsi aktif dan **kosong** saat panel tertutup.
- Opsi ditambah/dihapus dinamis saat panel terbuka → panah tetap bekerja di daftar terbaru.
- Klik `<label>` dengan mouse asli → fokus pindah ke select (jebakan §8 no. 5).
- Placeholder: **tampil hanya saat select difokus** (kosong & tidak difokus → hanya label); kotaknya
  tidak berubah tinggi/posisi panah saat placeholder tersembunyi (catatan user, 22 Sep 2026).
- Inspeksi ARIA: `role="combobox"`, `aria-expanded` berubah, `aria-activedescendant` menunjuk id opsi
  aktif, `aria-invalid` saat `[error]` terisi, `aria-describedby` menunjuk pesan.
- Panel di dalam `<wui-page>` dan di dalam dialog: tidak terpotong, klik luar menutup, fokus kembali.
- **Resize sambil panel terbuka** (ubah lebar jendela, atau lipat sidenav): lebar panel tetap sama
  dengan lebar field-nya, dan panel tetap menempel di bawah select-nya.
- Selagi panel terbuka: roda gulir **tidak** menggulir halaman, dan elemen di belakang panel tidak
  bereaksi (hanya panel yang tertutup).
- **Perkecil jendela** (mis. tinggi 420px) dengan trigger di tengah layar → panel **flip ke atas** dan
  **menyusut + menggulir** di dalam, tanpa keluar jendela (§9 baris 5).
- Varian `outlined` **dan** `filled`, terang & gelap, RTL (bila halaman ujinya sudah ada).
- Tinggi host sejajar field lain di baris yang sama.
- `formControlName`, `[(ngModel)]`, dan mode tanpa forms — ketiganya bekerja; nilai objek dengan
  `compareWith` menampilkan pilihan yang benar setelah `setValue` dari data API.

---

## 12. Referensi

- WAI-ARIA Authoring Practices — pola **combobox** + **listbox** (`aria-expanded`,
  `aria-activedescendant`, peta keyboard).
- Material 3 — *Menus* (struktur panel, tinggi item, elevasi) untuk angka yang menyusul.
- CDK: `cdk/overlay/index.d.ts`, `cdk/overlay-module.d.d.ts` (posisi & preset dropdown),
  `cdk/list-key-manager.d.d.ts`, `cdk/activedescendant-key-manager.d.d.ts` (dipakai — L10 = b),
  `cdk/listbox/index.d.ts` (hanya pembanding; tidak dipakai).
- Berkas repo yang akan disentuh: `src/select/**` (baru), `src/form-field/input.ts` +
  `src/form-field/field-control.ts` (L8), `src/form-field/form-field.html|ts` (klik label → fokus),
  `scss/components/_select.scss`, `scss/components/_form-field.scss` (satu `:has()` untuk `data-filled`),
  `scss/wui.scss`, `public-api.ts`, `abstracts/_tokens.scss` (token select + `$wui-z-select-panel`),
  `src/app/pages/select.page/**`, `src/app/app.routes.ts`, `docs/panduan-komponen.md`,
  `projects/wui/README.md`.
