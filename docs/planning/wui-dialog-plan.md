# Planning — `WuiDialog` (service + ref + style layer)

> Tujuan: **dialog modal** dengan API sendiri (`WuiDialogService` / `WuiDialogRef` / `WuiDialogOptions`),
> dirender ke **`document.body`** lewat `@angular/cdk/dialog`, dibungkus supaya tipe CDK tidak bocor ke
> public API.
>
> Plan terkait: `docs/planning/wui-app-page-stack-plan.md` (page stack — overlay **di dalam** `WuiApp`).
> Dua sistem overlay ini sengaja terpisah; lihat §4 soal urutannya.

Status: **F0 selesai** (spike empiris di container, 17 Sep 2026) — F1–F3 dalam pengerjaan.

---

## 0. Keputusan yang sudah dikunci

| # | Keputusan | Nilai |
| --- | --- | --- |
| G1 | **Istilah** | Widget = **dialog**; "modal" hanya kata sifat untuk perilakunya. Nama API: `WuiDialog*` (sejalan dengan ARIA `role="dialog"` dan `MatDialog`/`Dialog` CDK). |
| G2 | **Lokasi render** | **`document.body`** (`OverlayContainer` CDK), **bukan** di dalam `wui-app`. Page tetap di dalam `wui-app`. Konsekuensi: dialog tetap bisa dipakai di aplikasi yang tidak memakai `WuiApp`. |
| G3 | **Hasil** | Butuh result: `WuiDialogRef.close(result)` + `result`. Ini **beda** dari `WuiPageRef.close()` yang sengaja tanpa parameter (variance generic `C`). |
| G4 | **Alert** | Ditunda. `role` disiapkan (`'dialog' \| 'alertdialog'`) karena CDK hanya meneruskannya ke atribut — menambah alert nanti = menambah opsi, bukan arsitektur baru. |
| G5 | **Mesin** | `@angular/cdk` (`dialog` + `overlay`) sebagai peer dependency. Tipe CDK (`DialogRef`, `DIALOG_DATA`, `Observable`) **tidak** diekspor. |
| G6 | **Urutan lapisan** | `--wui-z-dialog: 1100` di atas `--wui-z-overlay: 1000` (page stack). |
| G7 | **Backdrop** | Class sendiri `wui-dialog__backdrop`, warna dari token `--wui-overlay-color`. Tidak memakai `cdk-overlay-dark-backdrop`. |
| G8 | **Impor Sass CDK** | **Tidak ada.** `@use '@angular/cdk/overlay'` gagal di build konsumen (T2), dan structural CSS-nya disuntikkan CDK sendiri (T13). Layer kita hanya menimpa (T14–T15). |
| G9 | **Dialog sistem** | `WuiDialogService.alert(options)` → `Promise<number \| null>`. Isinya datang sebagai **data**, jadi aplikasi tidak perlu komponen/`<ng-template>` per pesan (mis. error API). Satu komponen internal `WuiAlertDialog` (tidak diekspor). |
| G10 | **Tombol alert** | `(string \| WuiAlertButton)[]`. `string` = tombol biasa (bentuk `text`, warna netral); objek dipakai kalau perlu `variant`/`color` berbeda. Hasil = **index** tombol. |
| G11 | **Dismissed** | Ditutup tanpa memilih tombol → **`null`** (bukan `undefined`). Diatur `dismissible` (default `true` → `disableClose: !dismissible`). |
| G12 | **Konten** | Disanitasi Angular secara default; `SafeHtml` diterima untuk konten tepercaya. Baris baru dihormati (`white-space: pre-line`). |
| G13 | **Varian visual alert** | Ditunda: peran warna `warning` belum ada dan `wui-icon` butuh nama ikon yang didaftarkan aplikasi, jadi library tidak bisa menjaminnya. |

---

## 1. F0 — temuan spike (empiris, bukan asumsi)

Diuji di container `wui_angular_dev`, CDK **20.2.14** (versi terbaru seri 20; `^20.3.0` **tidak ada**).

| # | Yang diuji | Hasil |
| --- | --- | --- |
| T1 | Versi CDK | Seri 20 berhenti di **20.2.14**. Peer-nya `@angular/core: ^20.0.0 \|\| ^21.0.0` → cocok dengan Angular 20.3.31 repo. |
| T2 | Resolve Sass di build konsumen | ❌ `@use '@angular/cdk/overlay'` **gagal** di `@angular/build` — Sass-nya hanya me-resolve path relatif + `stylePreprocessorOptions.includePaths` (`Can't find stylesheet to import`), walaupun `npx sass` biasa berhasil. Entri root `@angular/cdk` juga memunculkan `DEPRECATION WARNING [if-function]` dari berkas `a11y` CDK. → **Tidak mengimpor Sass CDK sama sekali.** |
| T3 | **Popover / top layer** | ❌ **Tidak ada di 20.2.14** — tidak ada `usePopover` maupun `OVERLAY_DEFAULT_CONFIG`. (Dokumentasi resmi yang menyebut popover itu milik versi 21.) Jadi tidak ada promosi ke top layer: `z-index` kita tetap berkuasa. |
| T4 | Konfigurasi z-index | `OverlayConfig` **sudah tidak punya** properti `zIndex`. Satu-satunya pintu: Sass var `$overlay-container-z-index` / `$overlay-z-index` / `$overlay-backdrop-z-index`, yang bisa di-set lewat `@use … with (…)`. |
| T5 | Structural CSS | `@include cdk-overlay.overlay()` meng-emit seluruh `.cdk-overlay-container`, `.cdk-global-overlay-wrapper`, `.cdk-overlay-pane`, `.cdk-overlay-backdrop*`, `.cdk-global-scrollblock`. Tidak perlu `overlay-prebuilt.css` → kontrak "konsumen cukup `@use` satu berkas SCSS" tetap utuh. |
| T6 | Default a11y | `role='dialog'`, **`ariaModal=false`** ⚠️, `autoFocus='first-tabbable'`, `restoreFocus=true`, `disableClose=false`, `hasBackdrop=true`. → kita **wajib** men-set `ariaModal: true` sendiri. |
| T7 | Scroll | `DIALOG_SCROLL_STRATEGY` default = `createBlockScrollStrategy()` → scroll halaman diblokir otomatis, tidak perlu kita tangani. |
| T8 | Posisi | `createGlobalPositionStrategy().centerHorizontally().centerVertically()` → dialog tercentang. Tema bisa menimpanya lewat `positionStrategy` (tidak diekspos di v1). |
| T9 | Injector & data | `config.injector` **dipakai** untuk portal komponen maupun template → kita bisa menitipkan provider sendiri (`WuiDialogRef`, `WUI_DIALOG_DATA`). |
| T10 | Konteks template | CDK membangun `{ $implicit: config.data, dialogRef }` → `<ng-template let-data let-dialogRef="dialogRef">`. `dialogRef` di sini **milik CDK** (lihat utang U1). |
| T11 | Provider | `class Dialog` punya `providedIn: 'root'` → tidak perlu provider manual di aplikasi. |
| T12 | Zoneless | Playground memakai `provideZonelessChangeDetection()`. `Dialog` CDK aman (berbasis signal/observable), tapi **jangan** mengandalkan zone untuk memicu change detection setelah `close()`. |
| T13 | **Structural CSS CDK** | CDK **menyuntikkan sendiri** `.cdk-overlay-*` saat runtime lewat komponen `cdk-overlay-style-loader` (`_styleLoader.load(...)` di konstruktor service `Overlay`). → `overlay-prebuilt.css` **tidak** perlu, dan menyalin strukturnya ke layer kita juga **tidak** perlu. |
| T14 | **`@layer` pada z-index** | `z-index` CDK dibungkus `@layer cdk-overlay { … }`. Rule **di luar layer selalu menang** atas rule di dalam layer, jadi `z-index` cukup ditimpa biasa tanpa menaikkan specificity. Terbukti: `.cdk-overlay-container` terukur `1100` walau CDK menulis `1000`. |
| T15 | **`max-width` pane** | `max-width: 100%` pada `.cdk-overlay-pane` ada **di luar** layer, dan stylesheet CDK datang **setelah** style layer kita → rule specificity sama akan kalah. Wajib `.cdk-overlay-pane.wui-dialog` (0,2,0). Terbukti: sebelum perbaikan pane melebar 810px (selebar viewport, tidak tercentang); sesudah `560px` dan tercentang. |
| T16 | Scroll-lock | Class `cdk-global-scrollblock` dipasang ke `<html>` (bukan `body`) dan hanya aktif kalau halaman memang punya scrollbar (`_canBeEnabled()`). Di halaman pendek class itu **tidak** muncul — bukan bug. |

**Catatan rilis:** kalau nanti CDK dinaikkan, T13–T15 wajib diuji ulang — ketiganya bergantung pada
internal CDK (nama komponen loader, isi `@layer`, letak `max-width`) yang bisa berubah tanpa
mengubah API publik. Uji ulangnya murah: buka dialog, pastikan tercentang, `z-index` container = 1100.

---

## 2. Desain API

### 2.1 `WuiDialogOptions`

```ts
export interface WuiDialogOptions<D = unknown> {
  data?: D;                       // dibaca lewat `inject(WUI_DIALOG_DATA)` atau `let-data`
  id?: string;                    // dibuat otomatis kalau kosong
  role?: WuiDialogRole;           // 'dialog' (default) | 'alertdialog'  → disiapkan untuk alert
  panelClass?: string;            // default 'wui-dialog'
  backdropClass?: string;         // default 'wui-dialog__backdrop'
  hasBackdrop?: boolean;          // default true
  disableClose?: boolean;         // default false → ESC & klik backdrop menutup
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  autoFocus?: WuiDialogAutoFocus; // default 'first-tabbable'
  restoreFocus?: boolean | string | HTMLElement; // default true
  width?: string;                 // + minWidth/maxWidth/minHeight/maxHeight
  injector?: Injector;            // parent injector tambahan dari pemanggil
}
```

Yang **tidak** diekspos di v1: `positionStrategy`, `scrollStrategy`, `closeOnNavigation`,
`closeOnDestroy`, `direction`, `providers`. Bisa ditambah kalau ada kebutuhan nyata.

### 2.2 `WuiDialogRef` — handle + hasil

```ts
// Urutan generic: R (hasil) dulu, lalu C (konten) — mengikuti `DialogRef` CDK, karena R jauh
// lebih sering ditulis: `WuiDialogRef<boolean>`.
export class WuiDialogRef<R = unknown, C = unknown> {
  readonly id: string;
  readonly component: Signal<C | null>;     // instance komponen; selalu null di mode TemplateRef
  readonly closed: Signal<boolean>;
  readonly result: Promise<R | undefined>;  // selesai saat dialog ditutup
  close(result?: R): void;                  // idempoten
}
```

- `close()` **idempoten**, meniru `WuiPageRef.close()`. Boleh dipanggil dari `ngOnInit` komponen
  dialog sebelum handle tersambung — hasilnya dititipkan lalu dikirim saat tersambung.
- `result` berupa `Promise` (bukan `Observable`) supaya pemakaian zoneless sederhana:
  `await ref.result` / `ref.result.then(…)`. Kalau pemakai butuh RxJS, tinggal `from(ref.result)`.
- Penutupan selalu lewat satu jalur: event `closed` CDK yang menandai `closed()` dan menyelesaikan
  `result` — jadi status ref tidak bisa berbeda dari kenyataan, siapa pun yang menutupnya.
- Ref yang sama juga **injectable** di dalam komponen dialog: `inject(WuiDialogRef)`.

### 2.3 `WuiDialogService`

```ts
@Injectable({ providedIn: 'root' })
export class WuiDialogService {
  /** Buka dialog dari komponen. R eksplisit, C & D ditebak dari argumen. */
  open<R = unknown, C = unknown, D = unknown>(component: Type<C>, options?: WuiDialogOptions<D>): WuiDialogRef<R, C>;

  /** Buka dialog dari `<ng-template>` — konteks CDK: `let-data`, `let-dialogRef`. */
  openTemplate<R = unknown, D = unknown>(template: TemplateRef<D>, options?: WuiDialogOptions<D>): WuiDialogRef<R, D>;

  /** Tutup semua dialog yang terbuka, dari yang paling akhir dibuka. */
  closeAll(): void;

  /** Jumlah dialog yang sedang terbuka (signal). */
  readonly count: Signal<number>;
}
```

Cara kerja `open()`:

```ts
// 1. Buat ref lebih dulu — id-nya dipakai bersama oleh ref dan dialog CDK.
const ref = this.#createRef<R, C, D>(options);
// 2. Bangun config; di dalamnya dibuat injector anak: WuiDialogRef + WUI_DIALOG_DATA
//    (tanpa membocorkan token CDK). `config.injector` diteruskan CDK ke portal komponen
//    maupun template, jadi dialog bisa `inject(WuiDialogRef)`. `ariaModal: true` dipaksa.
//    Opsi aplikasi disalin HANYA yang terisi (lihat `onlyDefined` — CDK menggabungkan dengan
//    `{ ...defaults, ...config }` tanpa menyaring `undefined`, sehingga `undefined` akan
//    mematikan default seperti `hasBackdrop`/`role`/`restoreFocus`).
// 3. Buka lewat CDK, lalu sambungkan ref ke cdkRef (closed → signal + resolve promise).
return this.#register(ref, this.#dialog.open<R, D, C>(component, this.#buildConfig(options, ref)));
```

### 2.4 Contoh pemakaian

```ts
// pemanggil — R ditulis eksplisit, C & D ditebak dari argumen
const ref = this.dialogs.open<boolean>(KonfirmasiHapus, { data: { nama: 'Produk A' } });
const hasil = await ref.result;   // boolean | undefined

// komponen dialog — data & ref lewat injeksi
export class KonfirmasiHapus {
  protected readonly data = injectDialogData<{ nama: string }>();
  private readonly ref = inject<WuiDialogRef<boolean, KonfirmasiHapus>>(WuiDialogRef);
  protected batal() { this.ref.close(false); }
}
```

### 2.5 `WuiDialogService.alert()` — dialog sistem

```ts
const aksi = await this.dialogs.alert({
  title: 'Gagal menyimpan kontak',
  content: 'Server menolak permintaan.<br><code>HTTP 500</code>',
  buttons: ['Tutup', { label: 'Coba lagi', variant: 'filled', color: 'primary' }],
  dismissible: true,          // false → ESC & klik backdrop dimatikan
});
// aksi: 0 = 'Tutup' | 1 = 'Coba lagi' | null = ditutup tanpa memilih
```

Yang dilakukan `alert()` di balik layar: memberi id (`wui-alert-N`), menurunkan `titleId`/`contentId`
untuk `aria-labelledby`/`aria-describedby`, menormalkan tombol, lalu memanggil `open()` dengan
`role: 'alertdialog'`. `undefined` dari CDK diterjemahkan jadi `null` supaya hanya ada satu nilai
untuk "tidak memilih tombol".

---

## 3. Style layer

`scss/components/_dialog.scss` (mixin `dialog`) **tidak** memuat structural CSS sama sekali — itu
urusan CDK (T13). Isinya hanya empat penimpaan milik wui:

1. `.cdk-overlay-container { z-index: var(--wui-z-dialog, 1100); }` — urutan lapisan. Ditulis biasa
   (tanpa naik specificity) karena rule di luar layer menang atas `@layer cdk-overlay` milik CDK (T14).
2. `.cdk-overlay-backdrop { transition: … }` — fade backdrop memakai token motion wui.
   `prefers-reduced-motion` tetap dihormati karena CDK menimpanya lewat `transition-duration: 1ms`.
3. `.cdk-overlay-pane.wui-dialog` — permukaan dialog (latar, radius, elevasi, padding, `max-width`).
   Selector-nya ikut menyebut `.cdk-overlay-pane` karena alasan T15.
4. `.wui-dialog__backdrop { background-color: var(--wui-overlay-color); }` — dim, belum ada blur.
5. Struktur isi: `.wui-dialog__title` (`title.medium`), `.wui-dialog__content` (`body.medium` +
   `white-space: pre-line`), `.wui-dialog__actions` (flex, rata kanan, `gap` `--wui-space-2`).
   Dipakai dialog sistem, dan boleh dipakai dialog buatan aplikasi supaya jarak & tipografinya sama.
6. `.wui-dialog--alert` — penanda dialog sistem (dipasang otomatis oleh `alert()`), tersedia sebagai
   kait styling untuk aplikasi; saat ini belum punya aturan sendiri.

`panelClass` di `WuiDialogOptions` bersifat **tambahan**: `.wui-dialog` selalu dipasang service,
jadi permukaan dialog (latar/radius/padding) tidak bisa hilang karena salah isi. `backdropClass`
boleh menggantikan, mis. `'cdk-overlay-transparent-backdrop'` untuk dialog tanpa dim.

Token baru di `abstracts/_tokens.scss` (seksi `Dialog`):

| Variabel | Default | Catatan |
| --- | --- | --- |
| `$wui-z-dialog` | `1100` | di atas `$wui-z-overlay` (1000) |
| `$wui-dialog-radius` | `12px` | mengikuti `$wui-radius-lg`; **menunggu angka desainer** (M3 memakai 28px) |
| `$wui-dialog-max-width` | `560px` | |
| `$wui-dialog-min-width` | `280px` | ditambahkan setelah pengukuran: tanpa ini dialog berisi teks pendek menyusut ke **238px** |
| `$wui-dialog-padding` | `24px` | |
| `$wui-dialog-elevation` | M3 level 3 | `0 1px 3px 0 rgb(0 0 0 / 30%), 0 4px 8px 3px rgb(0 0 0 / 15%)` |

Semua di-emit sebagai `--wui-dialog-*` / `--wui-z-dialog` di `themes/_light-theme.scss`
(blok `:root`, bukan per mode — nilainya tidak bergantung tema).

---

## 4. Dua sistem overlay & urutan lapisan

| | Sumber | Dirender ke | z-index |
| --- | --- | --- | --- |
| **Page** | `WuiPageService` (ng-template, dikendalikan lifecycle komponen) | `.wui-app__overlay-host` di dalam `wui-app` | `--wui-z-overlay` (1000) |
| **Dialog** | `WuiDialogService` (komponen/ng-template, imperatif + hasil) | `.cdk-overlay-container` di `document.body` | `--wui-z-dialog` (1100) |

Aturan yang berlaku: **dialog selalu di atas page stack.** Konsekuensinya perlu ditulis di README,
karena page yang berada di bawah dialog tidak akan bisa diklik selama dialog terbuka (memang
perilaku modal yang diinginkan).

---

## 5. Risiko & jebakan

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| `ariaModal` default CDK **false** | Dialog tidak benar-benar modal untuk screen reader | `ariaModal: true` dipaksa di `WuiDialogService` — tidak bisa dimatikan pemakai (v1) |
| **Layer kita bergantung pada internal CDK** (T13–T15) | Kalau CDK berhenti menyuntikkan structural CSS, mengubah isi `@layer`, atau memindahkan `max-width`, dialog bisa tampil salah tanpa error | Catatan upgrade di §1 + komentar di `_dialog.scss`; uji ulang murah: buka dialog, pastikan tercentang & `z-index` container = 1100 |
| CDK naik ke v21 → popover/top layer | `--wui-z-dialog` tidak lagi menentukan urutan (T3) | Uji ulang saat upgrade; popover bisa dimatikan lewat `OVERLAY_DEFAULT_CONFIG` |
| Opsi `undefined` menimpa default CDK | `hasBackdrop` hilang, `role` hilang, fokus tidak dikembalikan | `onlyDefined()` hanya menyalin opsi yang terisi; `config` dibangun dari `new DialogConfig()` (§2.3) |
| `<ng-template>` menerima `dialogRef` milik CDK | Kebocoran tipe CDK di mode template (utang U1) | Didokumentasikan; solusi penuh = container kustom turunan `CdkDialogContainer` |
| Prerender (`www/prerendered-routes.json`) | `OverlayContainer` menyentuh `document` | ✅ Terbukti aman: `ng build` (dengan prerender) hijau, dialog hanya dibuka dari interaksi |
| Panel adalah `.cdk-overlay-pane` | `max-width: 100%` bawaan CDK melawan `--wui-dialog-max-width` | Selector `.cdk-overlay-pane.wui-dialog` (T15); **terukur** 560px & tercentang |
| `content` HTML dari data eksternal | Potensi XSS kalau HTML dipercaya buta | `[innerHTML]` Angular menyanitasi `string` secara default; `SafeHtml` hanya lewat pilihan sadar pemanggil (G12) |

---

## 6. Roadmap fase

### F0 — Spike ✅ **selesai** (17 Sep 2026)
- [x] Pasang `@angular/cdk@^20.2.0` (resolved 20.2.14)
- [x] Resolve Sass `@angular/cdk/overlay` + `with (…)` → spike `/tmp/spike-dialog`
- [x] Pastikan popover/top-layer tidak ada di 20.2.14
- [x] Baca `DialogConfig` default (khususnya `ariaModal=false`)
- [x] Pastikan `Dialog` `providedIn: 'root'`

### F1 — Service & ref ✅ **selesai**
- [x] `dialog.options.ts` — `WuiDialogRole`, `WuiDialogAutoFocus`, `WuiDialogOptions`, `WUI_DIALOG_DATA`, `injectDialogData<T>()`
- [x] `dialog.ref.ts` — `WuiDialogRef` (`close(result)` idempoten + titipan hasil, `closed`, `result`)
- [x] `dialog.service.ts` — `open()` / `openTemplate()` / `closeAll()` / `count` (registry bebas generic)
- [x] `public-api.ts` + `peerDependencies` `@angular/cdk: ^20.2.0` di `projects/wui/package.json`

**DoD ✅:** `ng build wui` hijau; satu-satunya penyebutan `@angular/cdk` di `dist/@wajek/wui/index.d.ts`
ada di komentar — tidak ada impor tipe CDK.

### F2 — Style layer ✅ **selesai**
- [x] Token `Dialog` di `abstracts/_tokens.scss` + emisi di `themes/_light-theme.scss`
- [x] `scss/components/_dialog.scss` + `@forward` di `_index.scss` + `@include` di `wui.scss`
- [x] `selector-class-pattern` di `.stylelintrc.json` mengizinkan class struktural `cdk-*`
      (dipakai untuk menimpa `.cdk-overlay-container` / `.cdk-overlay-backdrop`, tanpa `stylelint-disable`)

**DoD ✅:** `npm run lint:styles` bersih; CSS hasil build memuat
`.cdk-overlay-container{position:fixed;z-index:var(--wui-z-dialog, 1100)}` (structural sisanya dari CDK).

### F3 — Demo & verifikasi ✅ **selesai** (diukur di `http://wui.local`)
- [x] Halaman `/dialog` di playground: dialog komponen + dialog template + alert + `count()`
- [x] Komponen `HapusDialog` (injeksi data & ref), tautan dari beranda, rute lazy
- [x] Verifikasi visual lewat build (`ng build wui` → `ng build` → buka `wui.local`)

**Hasil pengukuran di browser:**

| Yang diuji | Hasil |
| --- | --- |
| Lokasi & posisi | `.cdk-overlay-container` anak langsung `<body>`, `z-index: 1100`; pane 560×186 **tercentang** X & Y |
| ARIA | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="hapus-dialog-title"` (accessible name terbaca "Hapus Produk A?") |
| Permukaan | latar `--wui-color-surface`, radius 12px, padding 24px, shadow M3 level 3, `max-width: min(560px, 100%)` |
| Backdrop | class `wui-dialog__backdrop`, latar `rgba(0, 0, 0, 0.4)` dari `--wui-overlay-color` |
| Fokus | masuk ke tombol pertama (`autoFocus` bawaan) dan **kembali ke tombol pemicu** setelah ditutup |
| Hasil | `close(true)` → `true`; ESC → `undefined` ("ditutup tanpa jawaban"); template `close('batal')` → `batal` |
| Alert | `disableClose` + `role="alertdialog"`: ESC **tidak** menutup, tombol "Batal" → `false` |
| Kebersihan | setelah ditutup: `count()` 0, `.cdk-overlay-container` **tanpa anak**, tidak ada pane/backdrop sisa |
| Prerender | `ng build` (termasuk prerender) hijau dengan CDK terpasang |

### F4 — Dialog sistem (`alert()`) ✅ **selesai** (diukur di `http://wui.local`)
- [x] `WuiAlertOptions` + `WuiAlertButton` (di `dialog.options.ts`, ikut ter-ekspor)
- [x] Komponen internal `WuiAlertDialog` (+ `alert-dialog.html`) — tidak diekspor dari public API
- [x] `WuiDialogService.alert()` + helper `normalizeButtons()`/`toArray()`
- [x] Struktur `.wui-dialog__title/__content/__actions` + token `$wui-dialog-min-width`
- [x] `@angular/platform-browser` masuk `peerDependencies` (tipe `SafeHtml`)
- [x] Demo bagian 4 di halaman `/dialog` (1 tombol, 2 tombol, `dismissible: false`)

**Hasil pengukuran di browser:**

| Yang diuji | Hasil |
| --- | --- |
| ARIA | `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby="wui-alert-2-title"`, `aria-describedby="wui-alert-2-content"` — keduanya menunjuk elemen yang ada |
| Lebar | 280px (sebelum token `min-width`: 238px), tercentang |
| Tombol `string` | `.wui-button--text` + `wui-button--color-default` (latar transparan) |
| Tombol objek | `{ variant: 'filled', color: 'primary' }` → `--filled` + `--color-primary` (mode gelap: latar `#d9d0ff`, teks `#05000f`) |
| Hasil | klik tombol index 1 → `index 1`; klik index 0 → `index 0`; ESC → `null (ditutup)` |
| `dismissible: false` | ESC **tidak** menutup, klik backdrop **tidak** menutup, hanya tombol (terverifikasi tetap terbuka setelah keduanya) |
| Konten | `white-space: pre-line` aktif → `\n` pada teks biasa dihormati; `<code>` pada konten HTML dirender |
| Fokus | kembali ke tombol pemicu setelah ditutup |

⚠️ **Catatan pengujian:** alat otomasi "klik" di browser bisa memicu klik kedua yang mendarat di tombol
alert yang baru muncul (dialog tertutup sendiri dengan `index 0`). Bukan bug library — saat diuji ulang
lewat Playwright (`page.click` + jeda 3 detik), dialog tetap terbuka. Jangan buru-buru menganggapnya
self-close saat menguji manual dengan alat yang sama.

### Utang yang dicatat
- **U1** — mode template: `let-dialogRef="dialogRef"` menerima `DialogRef` CDK, bukan `WuiDialogRef`.
- **U2** — nilai `$wui-dialog-radius` / padding masih placeholder, menunggu angka desainer.
- **U3** — penampilan alert khusus (ikon, warna per `type`, tata letak) belum ada; baru peran ARIA-nya.
  Butuh peran `warning` + angka desainer, dan ikon bergantung registry aplikasi (G13).
- **U8** — `alert()` belum bisa ditutup secara programatik (hanya `closeAll()`), karena yang
  dikembalikan hanya `Promise`, bukan `WuiDialogRef`. Tambahkan kalau ada kebutuhan nyata.
- **U4** — belum ada varian non-modal dan belum ada animasi masuk/keluar dialog (`ng-enter`/`ng-leave`
  CDK belum dipakai); backdrop hanya fade.
- **U5** — `panelClass` dari aplikasi selalu **ditambahkan** ke `.wui-dialog`. Kalau nanti perlu
  menggantinya total, sediakan opsi terpisah.
- **U6** — README belum punya bagian dialog (menyusul bersama G5 tombol).
- **U7** — F4 dari `wui-app-page-stack-plan.md` (`close(result)` untuk page) belum diseragamkan
  dengan `WuiDialogRef`; bentuknya sudah ada di sini sebagai acuan.
