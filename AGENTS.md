# wui-angular — panduan kerja agent

Repo library Angular **`@wajek/wui`** (style layer SCSS + komponen) beserta playground-nya.
Berkas ini ada di root dan selalu terbaca otomatis oleh agent (VS Code Copilot, Claude Code, Cursor, …),
jadi isinya sengaja **ringkas** — detailnya ada di `docs/panduan-*.md`, tautkan, jangan salin.

## 1. Aturan kerja — pengetesan hanya atas perintah user

User mengerjakan **pengetesan manual sendiri**. Karena itu:

- **Jangan** menjalankan test, build, lint, kompilasi SCSS, atau verifikasi/pengukuran di browser atas
  inisiatif sendiri — termasuk sebagai "langkah memastikan perubahan tadi berhasil".
- Kerjakan perubahannya saja, lalu laporkan apa yang diubah dan **apa yang belum diverifikasi**.
  Jangan mengklaim sesuatu "sudah bekerja/terukur" kalau tidak ada perintah untuk memeriksanya.
- Pengetesan dijalankan **hanya kalau user memerintahkannya** (mis. "coba build", "jalankan lint",
  "ukur di browser"). Perintah itu berlaku untuk permintaan tersebut, bukan izin permanen.
- Kalau ragu apakah sebuah langkah tergolong pengetesan, **tanya dulu** sebelum menjalankannya.

## 2. Fakta cepat

| Hal | Jawaban |
| --- | --- |
| Paket | `@wajek/wui` — komponen Angular + style layer dalam **satu** paket |
| Sumber versi | `projects/wui/package.json` (root `package.json` private, tetap `0.0.0`) |
| Entry style layer | `projects/wui/scss/wui.scss` — satu baris `@include` per fitur |
| Output build library | `dist/@wajek/wui` (folder `@wajek` literal) |
| Stack | Angular 20.3, ng-packagr 20.3, `@angular/cdk` 20.2, sass, stylelint |

## 3. Peta repo

- `projects/wui/scss/` — style layer, urutan wajib `abstracts → base → themes → components → layout → utilities`.
- `projects/wui/src/**` — komponen/directive, diekspor lewat `public-api.ts`.
- `src/app/pages/**` — halaman playground sekaligus dokumentasi hidup.
- `docs/planning/*.md` — plan & keputusan per fitur (riwayat **kenapa**, termasuk alternatif yang ditolak).
- `scripts/` — skrip utilitas repo (mis. `bump-version.mjs`).

## 4. Rujukan wajib baca sebelum mengubah sesuatu

| Dokumen | Isinya |
| --- | --- |
| `docs/panduan-kerja.md` | Alur kerja, pengetesan, build/preview, versi & rilis |
| `docs/panduan-scss.md` | Struktur layer, token, spacing/palet/heading, jebakan stylelint & Sass |
| `docs/panduan-komponen.md` | Per komponen: perilaku + jebakan terverifikasi |

Ringkasan konvensi yang paling mahal kalau dilanggar:

- Nilai desain **hanya** ditulis di `projects/wui/scss/abstracts/_tokens.scss`; emisi `:root` di `themes/`.
- Jangan menulis `margin-*`/`padding-*` manual di komponen — pakai mixin `a.space(...)`.
- Jangan pakai `!important` (dilarang lint); urutan layer yang mengatur kemenangan.
- Setiap `@forward` modul ber-`!default` harus berada **sebelum** modul lain yang `@use` modul itu.
