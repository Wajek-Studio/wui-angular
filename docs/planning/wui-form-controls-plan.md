# Planning — Form Controls (`@wajek/wui`)

> Tujuan: kontrol form milik library — perilaku (termasuk a11y) dan tampilannya, di atas elemen
> native dan/atau primitif `@angular/cdk`, dengan token `--wui-*` sebagai satu-satunya sumber nilai.
>
> Plan terkait: `wui-dialog-plan.md` (dialog + dialog sistem), `wui-app-page-stack-plan.md`,
> `wui-button-plan.md`.
>
> Status: **F0 ✅ selesai** (17 Sep 2026) — termasuk label mengapung + varian `outlined`/`filled`;
> K1, K2, K3, K4 dikunci. F1 berjalan sebagian.
>
> **Revisi API (17 Sep 2026):** input `label` dihapus. Label ditulis aplikasi sebagai elemen asli
> yang diproyeksi (`<label wuiLabel>`), sejajar dengan pola directive `[wuiButton]`/`[wuiInput]`.
> Geometri label varian `outlined` sudah diukur ulang (§8).
>
> **Revisi geometri label `filled` (17 Sep 2026):** istirahat **36px → 28px** (titik tengah kotak,
> sama dengan `outlined`) dan mengapung **8px → 16px** (masuk ke dalam kotak). Token
> `$wui-field-label-rest-filled` **dihapus** karena nilainya kini sama dengan `$wui-field-label-rest`.
> Terukur ulang di `http://wui.local/form` (§8).
>
> **Revisi varian `outlined` (17 Sep 2026):** border yang menebal 1px → 2px saat fokus dikompensasi
> dari padding lewat variabel baru `--wui-field-padding-offset` (default `0px`, jadi `1px` saat fokus)
> → kolom teks (border + padding) tetap **17px** di kedua keadaan: teks tidak bergeser saat diklik.
> Berlaku untuk `padding-inline` (input) dan `padding-block` (textarea). Sekaligus diperbaiki typo
> `--wui-motion-duratio-fast` → `--wui-motion-duration-fast` pada `transition` `.wui-input`; typo itu
> membuat **seluruh** deklarasi `transition` gugur (terukur: `transition-property: none`), jadi
> sebelumnya tidak ada animasi border sama sekali. Yang dianimasikan **hanya warna**
> (`border-color`, `background-color`): `border-width` dan padding kompensasinya harus bergerak
> bersamaan, dan menganimasikan salah satu saja membuat kolom teks berkedip 1px di tengah animasi.
> `$wui-field-focused-border-width` kini **di-emit** ke `:root` (sebelumnya hanya fallback `2px`,
> yang berarti nilai desain hidup di dua tempat).

---

## 1. Fakta CDK (terverifikasi di `@angular/cdk@20.2.14`)

Entry point yang tersedia: `a11y`, `accordion`, `bidi`, `clipboard`, `coercion`, `collections`,
`dialog`, `drag-drop`, `keycodes`, `layout`, `listbox`, `menu`, `observers`, `overlay`, `platform`,
`portal`, `scrolling`, `stepper`, `table`, `testing`, `text-field`, `tree`.

**Penting — ekspektasi perlu diluruskan.** CDK adalah kumpulan primitif **tanpa tampilan**; ia
**tidak** mengirim komponen form yang bisa "di-override style-nya". Perlu dibedakan dua kelompok:

| Kelompok | Isi | Cara kita pakai |
| --- | --- | --- |
| **CDK punya markup/perilaku** | `CdkListbox` + `CdkOption` (`cdk/listbox`), `cdkMenu` (`cdk/menu`), `CdkTextareaAutosize` + `CdkAutofill` (`cdk/text-field`), `CdkStepper`, `CdkTable`, `CdkTree`, `CdkAccordion`, `CdkDrag`/`CdkDropList`, `cdkTrapFocus`, `cdkConnectedOverlay`, `SelectionModel` + `UniqueSelectionDispatcher` (`cdk/collections`) | Dipakai apa adanya, lalu **ditata** dengan class `wui-*` kita |
| **CDK tidak punya** | input teks, textarea (tanpa autosize), checkbox, radio, switch, slider, datepicker, select | Kita tulis sendiri di atas elemen **native** — a11y, keyboard, dan keyboard mobile datang gratis dari browser |

Konsekuensi: "cukup override style dari CDK" berlaku untuk kelompok pertama saja. Untuk kelompok
kedua, yang kita "warisi" bukan CDK melainkan **perilaku native** — dan itu justru lebih aman
daripada meniru widget dengan `div`.

Catatan integrasi forms: `@angular/forms@20.3.31` **tidak** mengekspor API forms berbasis signal;
jalur resminya masih `ControlValueAccessor` (55 penyebutan di `index.d.ts`).

---

## 2. Inventaris kontrol form

Kolom "Dasar" = apa yang dirender; "CDK" = primitif yang dipakai; "Fase" = target pengerjaan.

| # | Kontrol | Dasar | Primitif CDK | Catatan | Fase |
| --- | --- | --- | --- | --- | --- |
| 1 | **Field wrapper** (label, hint, error, prefix/suffix, counter) | `<wui-field>` + slot | — | Fondasi semua kontrol; pemilik state `invalid`/`disabled` untuk pewarnaan | F0 |
| 2 | Input teks / number / password (+ prefix/suffix) | `<input wuiInput>` | — | Native: `type`, `inputmode`, `autocomplete` tetap milik browser | F1 |
| 3 | Textarea (+ autosize) | `<textarea wuiInput>` | `CdkTextareaAutosize` | Autosize = satu baris param | F1 |
| 4 | Checkbox | `<input type="checkbox" wuiCheckbox>` | — | Kotak digambar CSS (`appearance: none`), input tetap native | F2 |
| 5 | Radio group | `<input type="radio" wuiRadio>` dalam `[wuiRadioGroup]` | `UniqueSelectionDispatcher` | Panah keyboard native; dispatcher untuk koordinasi grup | F2 |
| 6 | Switch | `<input type="checkbox" role="switch">` | — | Hanya satu kontrol yang perlu `role="switch"` | F2 |
| 7 | Select (single & multiple) | `<select wuiSelect>` **native dulu** | — | Native: a11y + mobile picker gratis. Custom menyusul (K4) | F3 |
| 8 | Combobox / autocomplete | `<input>` + panel | `cdk/overlay` + `CdkListbox` + `ListKeyManager` | Yang paling mahal; jangan disatukan dengan select | F4 |
| 9 | Slider | `<input type="range" wuiSlider>` | — | Butuh `aria-valuetext` kalau nilainya tidak numerik | F4 |
| 10 | Upload berkas (+ drag & drop) | `<input type="file">` + zona | `CdkDrag`/`CdkDropList` | Drop hanya mempercepat; input tetap ada | F5 |
| 11 | Chips / tags input | `<input>` + chip list | `cdk/overlay` (saran) | Bergantung pada #8 | F5 |
| 12 | Tanggal / waktu | `<input type="date">` dulu, kalender menyusul | `cdk/overlay` | Kalender custom = proyek tersendiri | F5 |
| 13 | Stepper / wizard form | template | `CdkStepper` | Lebih ke pola, bukan kontrol | F5 |

Di luar lingkup v1: data grid kompleks (`CdkTable` sudah tersedia kalau nanti perlu), rich text
editor, upload multi-berkas dengan progres.

---

## 3. Keputusan yang perlu dikunci

### K1 — Integrasi dengan forms ✅ **dikunci: `ControlValueAccessor`**

**Dikunci 17 Sep 2026:** kontrol mengimplementasi CVA **dan tetap** mengekspos `input()`/`output()`
biasa, sehingga bisa dipakai dengan Reactive Forms, `ngModel`, maupun tanpa forms sama sekali.

| Opsi | Keterangan |
| --- | --- |
| **`ControlValueAccessor`** (rekomendasi) | Bekerja dengan Reactive Forms **dan** `ngModel`. Satu implementasi per kontrol, plus `NG_VALUE_ACCESSOR` multi-provider. Ini satu-satunya jalur yang menjamin `formControlName`/`formControl` bisa dipakai konsumen |
| Signal `model()` saja | Lebih ringkas dan cocok dengan gaya signal library, tapi **tidak** bisa dipasang ke `formControlName`; konsumen harus memetakan sendiri ke form |

Rekomendasi: CVA sebagai basis, dan **tetap** mengekspos `input()`/`output()` biasa supaya kontrol
bisa dipakai tanpa forms sama sekali (`<input wuiInput [value]="x()" (valueChange)="…">`).

### K2 — Native-first atau widget custom? ✅ **dikunci: native-first**

**Dikunci 17 Sep 2026:** kontrol dibangun di atas elemen native + CSS; widget custom hanya untuk
yang tidak punya padanan native (select, combobox, kalender).

| Opsi | Keterangan |
| --- | --- |
| **Native-first** (rekomendasi) | `input`/`textarea`/`select`/`input[type=checkbox\|radio\|range]` + CSS. A11y, keyboard, IME, mobile keyboard, dan mode high-contrast datang gratis |
| Widget custom semua | Kontrol penuh atas tampilan, tapi kita menanggung seluruh beban a11y (role, ARIA, keyboard map) — dan risikonya persis yang sudah kita hindari saat memutuskan memakai CDK |

### K3 — Nama API ✅ **dikunci: `<wui-form-field>` + label mengapung**

**Dikunci 17 Sep 2026:** wrapper bernama `<wui-form-field>`, dan **opsional** — kontrolnya tetap bisa
dipakai sendiri (`<input wuiInput>`) hanya dengan kehilangan wiring label & pesan.

**API final (setelah revisi):** label **tidak** lewat input `label`, tapi elemen `<label>` asli milik
aplikasi yang diberi directive `wuiLabel` — sejajar dengan `[wuiButton]` dan `[wuiInput]`:

```html
<wui-form-field hint="Kami tidak akan mengirim spam.">
  <label wuiLabel>Email</label>
  <input wuiInput type="email" formControlName="email" />
</wui-form-field>

<wui-form-field variant="filled">
  <label wuiLabel>Nama</label>
  <input wuiInput type="text" />
</wui-form-field>
```

`WuiLabel` mengisi sendiri atribut `for` dari id kontrol milik field (id dibuat otomatis kalau
kontrol tidak punya `id`), kecuali aplikasi sudah menulis `for` sendiri — jadi jaminan
"`for` label selalu cocok dengan id kontrol" tetap berlaku walau label sekarang diproyeksi.
Labelnya elemen `<label>` **asli** yang mengapung (Material-style), bukan `<span>` yang diposisikan
ulang: klik label tetap memfokuskan kontrolnya karena itu perilaku bawaan browser, dan tidak ada
JS yang menyalin posisi. Varian: `variant="outlined"` (default) dan `variant="filled"`.

Yang diurus field: `for` label ↔ id kontrol (id dibuat otomatis), `aria-describedby` → elemen pesan,
`aria-invalid` saat `[error]` terisi, dan pesan error **menggantikan** hint. Yang **tidak** diurus:
nilai, validasi, dan teks pesan — semuanya milik aplikasi (K1, K5).

Mengikuti pola yang sudah ada (`[wuiButton]` = directive pada elemen native):

```html
<wui-field>
  <label wuiLabel for="email">Email</label>
  <input wuiInput id="email" formControlName="email" />
  <span wuiHint>Kami tidak akan mengirim spam.</span>
  <span wuiError>Email wajib diisi.</span>
</wui-field>
```

Perlu diputuskan: apakah wrapper wajib (mendukung layout label/hint/error) atau opsional
(kontrol tetap bisa dipakai telanjang).

### K4 — Select: native dulu atau custom sejak awal? ✅ **dikunci: custom sejak awal**

**Dikunci 17 Sep 2026 (permintaan user):** select dibuat custom di atas `cdk/overlay` + `CdkListbox`.
`<select>` native tidak dipakai sebagai tahap awal.

Konsekuensi yang harus disadari sebelum F3 dimulai:

- Ini komponen **termahal** di daftar: trigger `role="combobox"` + `aria-expanded` + `aria-controls`,
  panel overlay, navigasi keyboard penuh (ArrowAtas/Bawah, Home/End, Enter, ESC), type-ahead,
  `compareWith` untuk nilai berupa objek, serta penataan fokus agar tidak bertabrakan dengan
  `FocusTrap` page/dialog (panel dirender ke `body`, di luar elemen page).
- Keputusan kecil yang perlu diambil lebih awal: nilai tersimpan sebagai objek atau primitif;
  `aria-activedescendant` atau roving tabindex; apakah option boleh HTML kaya.
- Prinsip native-first (K2) **tetap** berlaku untuk kontrol lain — select, combobox, dan kalender
  adalah pengecualiannya.
- Yang tadinya gratis dari `<select>` (mobile picker, keyboard, screen reader) kini tanggung jawab
  kita → masuk daftar pengujian manual (bukan cukup "build hijau").

### K5 — Siapa yang memiliki teks pesan error?

| Opsi | Keterangan |
| --- | --- |
| **Aplikasi** (rekomendasi) | Library hanya menyediakan slot + keadaan `invalid` (warna `danger`). Tidak ada i18n di library, tidak ada teks yang salah bahasa |
| Library punya default | Pesan seperti "Wajib diisi" tersedia otomatis, tapi library jadi harus punya sistem i18n (keputusan besar) |

### K6 — Bagaimana kontrol tahu state `invalid`/`touched`?

- **Inject `NgControl` (opsional)** bila ada — kontrol menyelaraskan `aria-invalid` dan warna dari
  form state. Ini cara Material.
- **Input eksplisit** (`[invalid]="…"`) — tanpa ketergantungan pada `@angular/forms`.

Rekomendasi: inject opsional + input eksplisit sebagai fallback, sehingga `<input wuiInput invalid>`
tetap bisa dipakai di luar forms.

### K7 — Adopsi Angular Material?

| | Ikut Material | Tetap CDK + tulis sendiri (rekomendasi) |
| --- | --- | --- |
| Cakupan | Semua komponen form siap pakai | Kita bangun bertahap sesuai kebutuhan |
| Theming | Sistem Sass Material (M2/M3) sendiri | Token `--wui-*` kita, tanpa dua sistem |
| Dependency | `@angular/material` (besar) + tema wajib | Sudah ada `@angular/cdk` |
| Risiko | Tampilan/mental model Material bocor ke design system kita; override bertumpuk | Biaya: kita menulis markup & style sendiri |

---

## 4. Arsitektur usulan

1. **`<wui-form-field>`** — wrapper *tanpa* CVA: mengurus layout label/hint/error dan **wiring a11y**
   (id ↔ `for`, `aria-describedby`, `aria-invalid`). Kontrol di dalamnya tetap elemen native yang
   bisa difokus browser.
2. **Kontrol = directive CVA pada elemen native** (`wuiInput`, `wuiCheckbox`, `wuiRadio`, `wuiSwitch`,
   `wuiSelect`), bukan komponen pembungkus. Konsekuensi baik: tidak ada DOM tambahan yang merusak
   label-`for`, `formControlName`, autofill, atau urutan tab.
3. **State bersama** (invalid, disabled, touched) lewat satu helper internal supaya pewarnaan
   konsisten dan tidak digandakan di tiap kontrol.
4. **Style** di `scss/components/_field.scss` (+ `_input.scss`, `_checkbox.scss`, …) dengan pola yang
   sudah berlaku: file berisi mixin, dipanggil `wui.scss`, tertib 5 level.
5. **Token**: sebagian sudah ada dan bisa dipakai langsung — `--wui-color-outline` (border),
   `--wui-color-danger` + `--wui-color-on-danger` (error), `--wui-color-disabled-*`, `--wui-radius-md`,
   `a.focus-ring`, `--wui-space-*`, kelas tipografi `wui-label-*`/`wui-body-*`.
   Token baru yang kemungkinan perlu (menunggu angka desainer): tinggi kontrol (per `size`),
   padding, ketebalan border, warna placeholder, warna border saat hover/focus/error.
6. **Zoneless**: kontrol yang mengimplementasi CVA wajib memanggil `onChange`/`onTouched` — jangan
   mengandalkan zone untuk memicu update.
7. **SSR/prerender**: jangan menyentuh `document` saat render (repo ini melakukan prerender).

---

## 5. Roadmap fase

| Fase | Isi | DoD |
| --- | --- | --- |
| **F0** ✅ | Token field + `scss/components/_form-field.scss` + `<wui-form-field>` (label mengapung, hint/error, varian `outlined`/`filled`) | **Selesai** — lihat §8 untuk hasil pengukurannya |
| **F1** ⏳ | `wuiInput` (teks, number, password, prefix/suffix) + textarea & autosize, CVA + state invalid/disabled | ✅ teks + textarea (tanpa CVA — native sudah bekerja dengan `formControlName`); ⏳ number/password, prefix/suffix, autosize |
| **F2** | Checkbox, radio group, switch | Keyboard & screen reader benar (diuji manual + inspeksi ARIA) |
| **F3** | `wuiSelect` **custom**: trigger + panel (`cdk/overlay` + `CdkListbox`), single-select, keyboard lengkap | Bisa dipilih hanya dengan keyboard; panel tidak terpotong induk; diukur di `wui.local` |
| **F4** | `wuiSelect` multiple + filter/type-ahead, lalu combobox/autocomplete + slider | — |
| **F5** | Upload (+drag-drop), chips, tanggal native | — |
| **F6** | README + halaman demo lengkap + contoh form validasi | Mencakup contoh error dari API (dipadukan dengan `WuiDialogService.alert()`) |

---

## 6. Risiko & jebakan

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| CVA + `ngModel` di zoneless | Nilai tidak ter-update sampai ada event lain | Selalu panggil `onChange`; uji eksplisit dengan `[(ngModel)]` |
| `providers: [NG_VALUE_ACCESSOR]` lupa `forwardRef` | Kontrol tidak dikenali forms | Satu pola di semua kontrol + satu test/demo |
| Overlay (combobox, kalender) di dalam `<wui-field>` | Panel terpotong `overflow`/`transform` induk | Selalu render panel lewat `cdk/overlay` ke `body` (pola yang sudah dipakai dialog) |
| Select custom (K4) | Seluruh beban a11y keyboard ada di kita — salah sedikit = tidak bisa dipakai tanpa mouse | Ikuti pola combobox WAI-ARIA; `CdkListbox` menyediakan navigasi & `aria-selected`; uji manual hanya-keyboard |
| Panel select vs focus trap page/dialog | Fokus bisa direbut balik oleh trap milik page | Panel dirender lewat `cdk/overlay` (di `body`) dan page memakai `FocusTrap` **dasar** — bukan yang ber-`FocusTrapManager`, yang memasang listener `focus` global (lihat `wui-app-page-stack-plan.md` §6) |
| stylelint | Pelanggaran berulang yang sudah pernah kena (`declaration-empty-line-before`, komentar `//` kosong, `$` variabel lokal) | Ikuti pola berkas komponen yang sudah ada |
| Teks error | Bahasa/i18n bocor ke library | K5: teks milik aplikasi |
| RTL | Padding/border asimetris rusak | Logical property (`margin-inline`, `padding-inline`) seperti layer spacing |
| `ng test` tidak bisa jalan di container (tanpa `CHROME_BIN`) | Regresi tidak tertangkap test | Verifikasi lewat 2 build + pengukuran di `wui.local` (pola yang sudah dipakai) |
| Angka desain belum ada | Kontrol terlihat "generik" | Tandai token sebagai placeholder, sama seperti `$wui-dialog-radius` |

---

## 7. Langkah berikutnya

1. Kunci sisanya: **K5** (pemilik teks error), **K6** (cara kontrol tahu state `invalid`),
   **K7** (Material/tidak). K1–K4 sudah dikunci.
2. Kumpulkan angka desain untuk tinggi/padding/border kontrol — nilainya sekarang placeholder,
   tersentralisasi di `$wui-field-*` sehingga memperbaruinya cukup di `abstracts/_tokens.scss`.
3. Lanjut **F1**: `input[type=number]`, `input[type=password]`, prefix/suffix, dan `CdkTextareaAutosize`.

---

## 8. F0 — hasil implementasi & pengukuran (17 Sep 2026)

Berkas: `src/form-field/form-field.ts` + `form-field.html` (komponen `<wui-form-field>`),
`src/form-field/label.ts` (directive `WuiLabel`), `src/form-field/input.ts` (directive `WuiInput`),
`scss/components/_form-field.scss`, token `$wui-field-*`, demo `/form` (5 bagian).

### Keputusan teknis yang diambil saat implementasi

| Topik | Keputusan |
| --- | --- |
| Cara field tahu kontrolnya | `WuiInput` meng-inject `WuiFormField` secara opsional. Proyeksi konten tetap berada di rantai injector-nya karena di template aplikasi kontrol itu memang **anak** `<wui-form-field>` |
| Sumber id | Aplikasi menang: atribut `id` pada kontrol (kalau ada) dilaporkan ke field; kalau tidak ada, id buatan field dipasang ke kontrol. `WuiLabel` lalu mengisi `for` dari id itu — kecuali aplikasi sudah menulis `for` sendiri |
| Atribut milik aplikasi | Nilai asli disimpan lalu dikembalikan saat directive dilepas; `aria-describedby` aplikasi **digabung**, bukan diganti |
| Pesan | Satu elemen untuk hint & error; `error` menang. `aria-live="polite"` supaya pesan baru diumumkan |
| Warna border | Satu variabel `--wui-field-border-color` (default `--wui-color-outline`) dibaca oleh `border` di `.wui-input` **dan** `border-bottom` varian `filled`; blok keadaan (`hover`/`focus-visible`/`[aria-invalid]`) hanya **mengubah variabel itu**. Pola indirection yang sama dengan `--wui-button-*` |
| Prefix/suffix, counter, tanda wajib | Belum ada — menunggu keputusan desain |

### Cara label mengapung (tanpa JS)

Keadaan "mengapung" dihitung CSS, bukan event JS:

- **Fokus** → `.wui-form-field:has(.wui-input:focus)`.
- **Terisi** → `.wui-form-field:has(.wui-input:not(:placeholder-shown))`. Karena memakai `:placeholder-shown`,
  `WuiInput` memasang `placeholder=" "` bila aplikasi tidak menulisnya (tanpa atribut `placeholder`
  selektor itu tidak pernah cocok). Efek sampingnya bagus: nilai yang di-set **programatik**
  (`setValue` tanpa event) tetap terbaca, karena yang dibaca DOM, bukan event.

Kedua keadaan itu hanya mengubah **custom property** di host field (`--wui-field-label-top`,
`--wui-field-label-scale`), dan `.wui-form-field__label` membacanya. Jadi selector `:has()` panjang
tidak digandakan di banyak aturan. Letak horizontalnya **tidak** ikut berubah: label selalu
`inset-inline-start: var(--wui-field-padding-inline)` (16px) di kedua keadaan — tidak ada geseran
horizontal maupun `padding` tambahan saat mengapung, sehingga kotak label persis 16px dari tepi
field pada saat istirahat maupun mengapung.

| Keadaan | Posisi label (`top`, titik tengah label) | Skala | Catatan |
| --- | --- | --- | --- |
| Outlined istirahat | **28px** = titik tengah kotak kontrol 56px | 1 (16px) | label menggantikan fungsi placeholder |
| Outlined mengapung | **0** (duduk di garis border atas) | 0.75 (12px) | latar `surface` menutup garis border → efek "terpotong" (notch) |
| Filled istirahat | **28px** = titik tengah kotak (sama dengan `outlined`) | 1 (16px) | label istirahat hanya ada saat kontrol kosong, jadi tidak ada baris teks yang perlu ditemani |
| Filled mengapung | **16px** (di dalam kotak; tepi label 7–25px) | 0.75 | tidak perlu memotong garis |

Jadi di varian `outlined` label istirahat **tepat di tengah** kotak (28px dari 56px) dan label
mengapung **tepat di garis atas** (0) — kontrol `outlined` memakai `padding-block: 0` (teks di
tengah), sedangkan padding cadangan (`--wui-field-label-space`) hanya dipakai varian `filled`.
Varian `filled` memakai **28px yang sama** saat istirahat: teks kontrolnya memang digeser 24px ke
bawah, tapi label istirahat hanya muncul saat kontrol masih kosong — tidak ada baris teks yang
perlu ditemani, dan titik tengah kotak itulah yang terbaca "pas" oleh mata (nilai lama 36px membuat
label terlihat turun). Saat mengapung label `filled` masuk **ke dalam** kotak (16px), bukan ke luar
seperti `outlined`.
Textarea `outlined` memakai `padding-block: var(--wui-space-3) var(--wui-space-2)` supaya titik
tengah baris pertamanya juga di 28px.

Placeholder bawaan browser disembunyikan selama label belum mengapung, supaya keduanya tidak
bertumpuk (perilaku yang sama dengan Material).

### ⚠️ Dua bug yang tertangkap saat pengujian (jangan diulang)

| Bug | Gejala | Sebab |
| --- | --- | --- |
| Host `wui-form-field` tidak punya class `wui-form-field` | Seluruh style container (termasuk `position: relative`) **tidak pernah berlaku** — `position` terukur `static`, label `transform` diabaikan karena custom property-nya kosong. Sempat lolos karena pengukuran sebelumnya hanya memeriksa properti `.wui-input` | Class dasar wajib dipasang di host (`host: { class: 'wui-form-field' }`), seperti `WuiButton`. Nama elemen ≠ class |
| Transisi `top`/`transform` di halaman preview yang **tidak visible** tidak maju | `getComputedStyle` melaporkan posisi **lama** di luar keadaan yang benar-benar berlaku — sempat terbaca "label tidak mengapung padahal fokus" | Matikan transisi sebelum mengukur; jangan simpulkan dari nilai computed sesaat (pola yang sama dengan gotcha tombol) |

### Hasil pengukuran di `http://wui.local/form`

| Yang diuji | Hasil |
| --- | --- |
| `for` ↔ id | Cocok di **6/6** field; id otomatis `wui-form-field-N` |
| `aria-describedby` ↔ id pesan | Cocok di 6/6 |
| Accessible name | Terbaca browser: `textbox "Nama lengkap"`, `textbox "Email" [invalid]` |
| Error | `aria-invalid="true"`, pesan error menggantikan hint, warna `danger` (`rgb(242,184,181)` di mode gelap) |
| Ukuran | input 56px, radius 8px, `padding-inline` 16px; textarea 96px + `resize: vertical` |
| Validasi form | Simpan dengan form kosong → `Wajib diisi.` + status `form belum valid`; `"ab"` → `Minimal 3 karakter.`; email salah → `Format email tidak valid.`; semua valid → status berisi JSON nilainya |
| Fokus — `outlined` | Border `rgb(50, 0, 149)` = `--wui-color-primary` di **keempat** sisi (input & textarea) |
| Fokus — `filled` | Hanya `border-bottom` yang jadi `primary`; `border-top` terbaca `rgb(26, 26, 26)` = `currentColor` warisan karena `border: 0` (bukan bug) |
| Kolom teks — `outlined` | Istirahat: border 1px + padding 16px = **17px**; fokus: border 2px + padding 15px = **17px** → teks tidak bergeser (sebelumnya 18px → 18px lewat `padding-inline: calc(… + 1px)`); kolom teks `filled` 16px (border samping 0) di kedua keadaan |
| Inset vertikal textarea — `outlined` | Istirahat 16px/8px padding + 1px border = **17px / 9px**; fokus 15px/7px padding + 2px border = **17px / 9px** → baris pertama tidak bergeser saat diklik |
| `transition` — `.wui-input` | Terukur `border-color, background-color / 0.24s` (hanya warna; `border-width` & padding sengaja tidak dianimasikan agar kolom teks tidak berkedip) — sebelumnya `transition-property: none` karena typo nama variabel (lihat jebakan di bawah) |
| Hover tanpa fokus | Kedua varian → `color(srgb 0.102 0.102 0.102 / 0.45)` (`color-mix(on-surface 45%, transparent)`) |
| Invalid + fokus | `danger` (`rgb(179, 38, 30)`) menang atas hover & fokus di kedua varian — blok keadaan ditulis terakhir |
| Label — istirahat (outlined) | Titik tengah label **28px** — persis setengah kotak 56px; kiri **16px**; skala 1 / font 16px; latar transparan; placeholder browser tidak terlihat |
| Label — outlined mengapung | Titik tengah **0px** (duduk di garis border atas); kiri **16px** (tidak bergeser); skala 0.75 / 12px; latar `surface` sehingga garisnya terpotong |
| Label — filled | Istirahat **28px** (titik tengah kotak 56px, sama dengan outlined), mengapung **16px** — tepi label 7–25px sehingga seluruh kotak label **di dalam** field (tidak ada bagian yang keluar dari tepi atas); skala 0.75; input memakai latar `surface-container` dan hanya garis bawah (`border-top: 0px`) |
| Label — klik mouse | Klik label memfokuskan kontrolnya (perilaku bawaan `<label for>`) sekaligus mengapungkan label — diuji dengan klik mouse sungguhan, bukan `label.click()` |
| Nilai programatik | `input.value = 'x'` **tanpa event** tetap membuat label mengapung (bukti deteksi murni CSS) |
| Textarea | Aturan mengapung sama; istirahat 28px, mengapung 0px (outlined) / 16px (filled); titik tengah baris pertama 28px |

### ⚠️ Jebakan yang ditemukan (jangan diulang)

| Jebakan | Akibat | Solusi |
| --- | --- | --- |
| Urutan blok `hover` → `focus` → `invalid` tidak dijaga | `:hover:not(:disabled)` specificity-nya **3 kelas**, mengalahkan `[aria-invalid]` (2 kelas) → border field invalid berubah abu-abu saat disentuh mouse. Terukur: `color(srgb … / 0.45)` alih-alih `danger` | Hover ditulis `&:where(:hover):not(:disabled)` — `:where()` menyumbang specificity 0, sehingga urutan tulisan yang menentukan. Terbukti: invalid tetap `danger` saat hover & fokus |
| `border-color` bertransisi 0.24s | Pengukuran sesaat setelah keadaan berubah bisa menangkap warna antara | Tunggu transisi selesai sebelum mengukur (pola yang sama dengan gotcha tombol) |
| Komentar `//` tepat setelah blok variabel/`@include` | `scss/double-slash-comment-empty-line-before` + `declaration-empty-line-before` menolak | Sisipkan baris kosong, atau pindahkan komentar ke akhir blok| `:has(:focus)` diuji di halaman preview yang **tidak aktif** | `document.hasFocus()` `false` → pseudo-class `:focus` **tidak cocok** sama sekali, jadi label tidak pernah mengapung walau `document.activeElement` sudah `INPUT`. Sempat terbaca seperti bug CSS padahal bukan | Panggil `page.bringToFront()` dulu, lalu pastikan `document.hasFocus()` `true`; atau uji cabang "terisi" (`fill()` nilai lalu kosongkan) yang tidak butuh fokus |
| Selector keadaan dan selector varian sama-sama **2 kelas**, varian ditulis belakangan | `.wui-form-field--filled .wui-input` menulis ulang `border-bottom-color` (specificity 0,2,0, **muncul setelah** `.wui-input:focus-visible` yang juga 0,2,0) → garis bawah varian `filled` **tidak pernah** ikut berubah saat hover/fokus/invalid. Bug ini tersamarkan selama `@include a.focus-ring;` masih aktif (cincin `outline` menutupi gejala). Terukur di CSS build: `.wui-input:focus-visible` di byte 25300, `.wui-form-field--filled .wui-input` di byte 25639 | Jangan menaruh warna yang dipakai bersama di banyak selector; pakai indirection satu variabel (`--wui-field-border-color`) sehingga state mengubah *variabel*, bukan properti. Kalau tetap ingin mengandalkan urutan, blok varian harus ditulis **sebelum** blok keadaan |
| Mengukur `border-color` tepat setelah `el.focus()` di dalam satu `evaluate` | `getComputedStyle` mengembalikan nilai **lama** (state belum di-recalc / halaman tidak ter-render) → seolah-olah fokus tidak mengubah warna. Terbukti salah: setelah klik mouse nyata + jeda, semua varian benar | Lakukan fokus dan pembacaan di **dua `evaluate` terpisah** dengan jeda, atau pakai interaksi nyata (klik/Tab); nilai variabel (`getPropertyValue('--wui-field-border-color')`) lebih dulu berubah daripada `border-color` yang bertransisi |
| **Self-reference** custom property: `--x: calc(var(--x, 16px) - 1px)` di elemen yang juga membacanya | Deklarasinya **invalid**, bukan dihitung jadi `15px` — browser memperlakukannya sebagai siklus. Terukur di Chromium: `getComputedStyle(el).getPropertyValue('--x')` → `""` (string kosong), dan elemen **anak** yang mewarisinya ikut `""`. Akibatnya `var(--x, 16px)` jatuh ke **fallback**, jadi pengurangan padding 1px "hilang" tanpa error apa pun | Untuk menyesuaikan nilai per-state, pakai variabel **kedua** yang dibaca komponen (`--wui-field-padding-offset`, default `0px`) lalu ubah variabel itu di blok `:focus`; jangan menimpa variabel yang sedang dibaca elemen yang sama |
| Typo nama variabel di dalam shorthand `transition` (`var(--wui-motion-duratio-fast)`) | `var()` tanpa fallback → **seluruh** deklarasi `transition` invalid at computed-value time, jadi semua properti di daftar itu kehilangan animasinya. Terukur: `transition-property: none`, `transition-duration: 0s` (border berubah instan, bukan bertransisi 0.24s) | Setiap `var()` di dalam `transition` harus memakai nama yang benar; verifikasi dengan membaca `transitionProperty`/`transitionDuration` di browser, jangan cukup dari kode |