# @wajek/wui

Library komponen + **style layer** untuk Wajek, dipakai lintas project Angular.

> ⚠️ **Status: Fase 0** — style layer masih placeholder (`scss/wui.scss` baru meng-emit penanda).
> Rencana lengkap: `docs/planning/scss-wui-plan.md`.

## Style layer (SCSS)

Style **tidak di-inject otomatis**. Setiap real app memasangnya **manual** di `src/styles.scss`:

```scss
// src/styles.scss
@use '@wajek/wui/scss/wui.scss';
```

Tanpa langkah lain: tanpa entri di `angular.json → styles[]`, tanpa `stylePreprocessorOptions`.

### Kontrak publik style

| Specifier | Isi | Emit CSS |
| --- | --- | --- |
| `@wajek/wui/scss/wui.scss` | **Semua layer** (entry utama) | ✅ |
| `@wajek/wui/scss/tokens.scss` | Token + CSS variables `--wui-*` | ✅ |
| `@wajek/wui/scss/base.scss` | Reset + root | ✅ |
| `@wajek/wui/scss/utilities.scss` | Utility class (opsional) | ✅ |
| `@wajek/wui/scss/themes/dark.scss` | Blok theme dark | ✅ |
| `@wajek/wui/scss/components/button.scss` | Mixin komponen | ❌ (murni mixin) |

**Aturan pemuatan:** entry yang emit CSS saling eksklusif — pakai `wui.scss` **atau** kombinasi granular,
jangan dua-duanya (CSS jadi dobel). File `components/*.scss` murni mixin, jadi aman digabung dengan entry apa pun.

### Token warna: skema vs peran

Istilahnya mengikuti Material 3, dan ada tiga lapisan:

| Lapisan | Isi | Contoh token |
| --- | --- | --- |
| **Skema** — satu set peran per mode | Sumber nilai. Bawaannya = export **Material Theme Builder** (seed `#593bb4`), 45 peran | `$wui-schemes: ('light': ('primary': #635690, …), …)` |
| **Peran** — token semantik | Yang dibaca komponen | `--wui-color-primary`, `--wui-color-on-surface-variant`, `--wui-color-error` |
| **Palet** — data intensitas (opsional) | Skala tone mentah; tidak dipakai peran bawaan | `--wui-color-<palet>-<tone>` |

Cara termudah mengganti warna: pakai generator yang **ikut terbit di paket ini**.

```bash
npx wui-theme src/theme/material-theme.json     # → src/theme/_wui-schemes.scss
```

Bungkus jadi skrip npm sendiri supaya tidak perlu mengingat path-nya (`wui-theme` otomatis ada di
`node_modules/.bin` saat skrip npm berjalan):

```json
"theme:build": "wui-theme src/theme/material-theme.json"
```

```scss
// src/styles.scss
@use './theme/wui-schemes' as theme;
@use '@wajek/wui/scss/wui.scss' with ($wui-schemes: theme.$wui-schemes);
```

Menulis skema sendiri juga boleh — nilai sebuah peran boleh `(palet, tone)` · warna (`#rrggbb`) ·
string CSS apa adanya (mis. `color-mix(…)`) · `false` (peran tidak di-emit). Saat build diverifikasi:
**`$wui-role-required` harus lengkap** (aksen + `on-*`, `surface`/`on-surface`/`on-surface-variant`,
`surface-container-low`, `outline`/`outline-variant`, dan `*-container` + `on-*-container` untuk
primary/secondary/error), dan setiap `X`/`X-container` yang ada harus punya `on-*`-nya. Kalau tidak →
build gagal dengan pesan yang menyebut peran yang hilang. Peta yang diberikan **menggantikan** peta
bawaan (tidak digabung), jadi praktisnya pakai generator di atas.

Di luar peran M3, library menambahkan: `default`/`on-default` (permukaan netral untuk tombol
`color="default"` — mendelegasikan ke `surface-container-high`), `disabled-container`,
`disabled-content`, dan state layer `--wui-color-state-layer-<peran>-opacity-08/10/16`. Peran yang
tidak ada di skema aplikasi dilewati — hanya yang wajib yang menggagalkan build.

⚠️ **Breaking (satu mayor):** peran `danger`/`on-danger` sudah diganti `error`/`on-error` mengikuti
M3; alias `--wui-color-danger` → `var(--wui-color-error)` masih di-emit supaya tidak pecah.

### Konvensi yang dibekukan

- Nama folder `scss/` dan file `wui.scss` adalah **public API** — mengubahnya = *breaking change*.
- File **tanpa** prefix `_` = public, boleh di-`@use` konsumen. Prefix `_` = internal partial.
- Class: prefix `wui-` + BEM ringan → `.wui-button`, `.wui-button__icon`, `.wui-button--lg`, state `.is-loading`.
- CSS variable: `--wui-<kategori>-<nama>` · SCSS variable: `$wui-<...>` (selalu `!default`).
- Komponen hanya boleh membaca token lewat **CSS variable** — dilarang hardcode nilai.
- Dilarang `@import` dan prefix `~`; pakai `@use` / `@forward`.
- Dilarang `!important` (kecuali utility).

Semua aturan di atas ditegakkan lewat stylelint: `npm run lint:styles`.

## Development di workspace ini

```bash
ng build wui                 # hasil build ke dist/@wajek/wui
ng build wui --watch         # terminal 1 — library
npm run watch                # terminal 2 — app (ng build --watch)
```

Playground (`wui-angular`) memakai specifier **yang sama persis** dengan real app:

```scss
// src/styles.scss
@use '@wajek/wui/scss/wui.scss';
```

Resolusinya tidak lewat `node_modules`, tapi lewat `angular.json` yang diarahkan ke folder `dist`:

```json
// projects.wui-angular.architect.build.options DAN .test.options
"stylePreprocessorOptions": { "includePaths": ["dist"] }
```

`dest` di `ng-package.json` sengaja meniru struktur scoped package (`dist/@wajek/wui`), sehingga specifier di
atas menemukan `dist/@wajek/wui/scss/wui.scss` — tanpa symlink dan tanpa `npm link`.

> ⚠️ `compilerOptions.paths` di `tsconfig.json` **tidak** memengaruhi resolusi Sass — itu hanya untuk
> TypeScript dan bundler JS. `paths` diisi `@wajek/wui` → `./dist/@wajek/wui` untuk import TypeScript.
> Resolusi `@use` lewat `node_modules` hanya berlaku di real app yang meng-install paket ini dari registry.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the library, run:

```bash
ng build wui
```

This command will compile your project, and the build artifacts will be placed in the `dist/` directory.

### Publishing the Library

Paket ini scoped (`@wajek/wui`), jadi akses publik sudah diatur lewat `publishConfig.access: "public"` di
`projects/wui/package.json` — `npm publish` tidak perlu flag tambahan.

Once the project is built, you can publish your library by following these steps:

1. Navigate to the `dist` directory (sesuai `dest` di `projects/wui/ng-package.json`):
   ```bash
   cd dist/@wajek/wui
   ```

2. Run the `npm publish` command to publish your library to the npm registry:
   ```bash
   npm publish
   ```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
