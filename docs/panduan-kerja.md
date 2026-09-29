# Panduan kerja

Aturan & alur kerja repo `wui-angular`. Pintu masuknya `AGENTS.md`; jangan menyalin isi berkas ini ke
sana.

## 1. Pengetesan hanya atas perintah user

User mengetes **manual**. Semua ini termasuk pengetesan dan **tidak** boleh dijalankan sendiri:

| Termasuk pengetesan | Contoh |
| --- | --- |
| Test unit | `ng test`, Karma |
| Build | `ng build`, `ng build wui`, `ng packagr` |
| Lint | `npm run lint:styles`, `npx stylelint …` |
| Kompilasi sass langsung | `npx sass <file> out.css` (termasuk untuk "sekadar melihat output") |
| Verifikasi/pratinjau di browser | `ng serve`, membuka fixture, mengukur `getComputedStyle`, Playwright |

Yang **bukan** pengetesan dan boleh dijalankan: membaca berkas, `grep`, `git status`/`git diff`,
mengedit kode, dan skrip repo yang memang diminta (mis. `node scripts/bump-version.mjs --dry-run`).

Cara melapor yang diharapkan:

1. Sebutkan berkas & perubahan yang dibuat.
2. Sebutkan eksplisit **apa yang belum diverifikasi** (mis. "belum di-build, belum dilihat di browser").
3. Jangan mengarang hasil pengukuran; kalau user minta ukur, baru jalankan perintahnya.

## 2. Alur kerja & lingkungan

- **Dev container**: `wui_angular_dev` (image `mochrira/dev`, Alpine 3.21 musl, Node 22, npm 10.9).
  Workspace di-mount ke `/workspace`; shell hanya `sh`/`ash` — **tidak ada bash**.
  Perintah build dijalankan lewat `docker exec -w /workspace wui_angular_dev sh -c "…"`.
- **Preview tanpa `ng serve`**: container mem-publish port 80 dengan domain lokal `wui.local` yang
  menyajikan hasil build root app (`www/`). Alur self-test yang benar: `ng build wui` → `ng build` →
  buka `http://wui.local`.
- ⚠️ Playground me-resolve `@use '@wajek/wui/scss/wui.scss'` lewat
  `angular.json → build.options` **dan** `test.options` → `stylePreprocessorOptions.includePaths: ["dist"]`
  — bukan lewat symlink/node_modules, dan `tsconfig.json → paths` tidak berpengaruh untuk Sass.
  Konsekuensinya: SCSS yang dipakai preview berasal dari `dist`, jadi **`ng serve` perlu di-restart**
  setelah `ng build wui` (isi `dist` berubah tidak memicu rebuild).
- Konsumen memuat style secara manual: `@use '@wajek/wui/scss/wui.scss';` di `src/styles.scss`.

## 3. Versi & rilis

- Versi library ada di **satu** tempat: `projects/wui/package.json` (root `0.0.0`, private; library
  tidak terdaftar di `package-lock.json`; tidak ada npm workspaces).
- `scripts/bump-version.mjs` — menaikkan versi (menulis hanya baris `"version"`, format file utuh):

  ```bash
  npm run release:patch                    # 20.0.0 -> 20.0.1
  npm run release:minor
  npm run release:major
  npm run version:bump -- premajor --preid beta
  npm run version:bump -- 21.0.0-beta.1     # set eksplisit
  ```

  Opsi: `--dry-run`, `--commit`, `--tag[=NAMA]`, `--push`, `--build`, `--sync-peers`,
  `--preid <id>`, `--message <m>`, `--allow-dirty`, `--no-verify`.
- Konvensi tag: **versi polos** (mis. `17.2.1`), bukan `v17.2.1`. Pesan commit rilis: `release: v<versi>`.
- `--commit` menolak worktree kotor; repo ini sering berisi WIP → pakai `--allow-dirty` bila memang mau.
- Publish: `npm run build:wui` → `cd dist/@wajek/wui` → `npm publish`
  (scoped + `publishConfig.access: "public"`, jadi tanpa flag tambahan).

## 4. Konvensi repo

- Jangan membuat skrip bantu di folder `tools/` — folder itu sudah dibubarkan atas permintaan user.
- Skrip npm yang ada: `start`, `build`, `build:wui`, `theme:build`, `theme:check`, `watch`,
  `lint:styles`, `test`, `version:bump`, `release:patch|minor|major`.
- Dokumentasi halaman demo tinggal di `src/app/pages/**`; **jangan** menulis class/tema dokumen sendiri
  di sana — pakai class yang sudah ada di `@wajek/wui` (mis. `wui-container`, `wui-py-5`,
  `wui-body-large`, `<table wuiTable class="is-dense">`).
- Keputusan desain per fitur dicatat di `docs/planning/<fitur>-plan.md`; kalau sebuah keputusan
  berubah, perbarui plan-nya, jangan cuma kodenya.

## 5. Generator tema warna (Material Theme Builder)

`projects/wui/bin/wui-theme.mjs` (Node biasa, **tanpa** dependensi) mengubah export MTB jadi berkas
SCSS `$wui-schemes`. Bentuk, alasan, dan keputusannya ada di `docs/planning/wui-color-mtb-plan.md`.

```bash
# dari repo library ini (skrip npm sudah menunjuk berkas playground)
npm run theme:build                       # src/theme/default.json → src/theme/_wui-schemes.scss
npm run theme:check                       # bandingkan saja; keluar 2 bila basi/belum ada
npm run theme:build -- ~/Downloads/x.json -o src/theme/_wui-schemes.scss
npm run theme:build -- --unknown=warn     # lihat kunci skema yang belum dikenal, jangan langsung gagal

# dari aplikasi konsumen (@wajek/wui sudah terpasang)
npx wui-theme src/theme/material-theme.json
```

- Skripnya **ikut terbit di dalam paket**: `projects/wui/bin/**` terdaftar di `projects/wui/ng-package.json`
  → `assets`, dan `bin` di `projects/wui/package.json` menyediakan perintah `wui-theme`. Konsumen
  **tidak** perlu menyalin skrip apa pun.
- Konsumen cukup menambah skrip npm sendiri:
  `"theme:build": "wui-theme src/theme/material-theme.json"` (`node_modules/.bin` otomatis ada di `PATH`
  saat npm script berjalan).
- ⚠️ Field `scripts` **dibuang** ng-packagr saat build (dianggap risiko keamanan), jadi skrip npm tidak
  bisa dititipkan dari sisi library — jalurnya `bin` seperti di atas. Field `bin` sendiri **aman**
  (diverifikasi dengan membaca `write-package.transform.js` di `node_modules/ng-packagr`).
- Semua path di generator dihitung dari **direktori kerja**, bukan dari lokasi skrip, supaya perintah
  yang sama jalan di repo library maupun di aplikasi konsumen.

- Berkas hasilnya **generated** — jangan diedit tangan; ubah warna di MTB lalu regenerate.
- Yang ditulis: `$wui-schemes` (`light` + `dark`, 45 peran masing-masing) dan `$wui-palletes`
  (skala palet mentah dari `palettes` MTB — data rujukan, **tidak** dipakai library; beda dari
  `$wui-palettes`/`$wui-palettes-extra` milik library).
- Kunci deprecated M3 (`background`, `onBackground`, `surfaceVariant`, `surfaceTint`) dilewati dan
  dicatat di header berkas; kunci skema yang tak dikenal **menggagalkan** proses (pakai
  `--unknown=warn` untuk melihat daftarnya lebih dulu).
- Kode keluar: `0` berhasil/sinkron · `1` gagal · `2` `--check` menemukan berkas basi atau belum ada.
- 4 skema varian kontras MTB belum dipakai (M5) — mengaktifkannya melipatgandakan CSS.
- ⚠️ Kalau nanti repo memakai formatter (prettier dsb.), **kecualikan berkas generated** — kalau
  tidak, `npm run theme:check` akan selalu melaporkan "basi".
