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
