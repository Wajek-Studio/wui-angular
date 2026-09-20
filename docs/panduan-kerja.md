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
- Skrip npm yang ada: `start`, `build`, `build:wui`, `watch`, `lint:styles`, `test`,
  `version:bump`, `release:patch|minor|major`.
- Dokumentasi halaman demo tinggal di `src/app/pages/**`; **jangan** menulis class/tema dokumen sendiri
  di sana — pakai class yang sudah ada di `@wajek/wui` (mis. `wui-container`, `wui-py-5`,
  `wui-body-large`, `<table wuiTable class="is-dense">`).
- Keputusan desain per fitur dicatat di `docs/planning/<fitur>-plan.md`; kalau sebuah keputusan
  berubah, perbarui plan-nya, jangan cuma kodenya.
