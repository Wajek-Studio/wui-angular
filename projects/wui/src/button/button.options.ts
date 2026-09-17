/** Varian warna tombol. Mengikuti konfigurasi warna Material 3. */
export type WuiButtonVariant = 'filled' | 'outlined' | 'text';

/** Ukuran tombol. `md` adalah ukuran default Material 3 (40px). */
export type WuiButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Peran warna tombol — berlaku untuk ketiga varian (`filled`/`outlined`/`text`).
 *
 * - `default` — netral; container diturunkan dari `surface`/`on-surface` (peran `default`).
 * - `primary` — warna brand (`primary`/`on-primary`).
 * - `danger` — untuk aksi destruktif (`danger`/`on-danger`).
 */
export type WuiButtonColor = 'default' | 'primary' | 'danger';

/**
 * Sisi tempat ikon berada.
 *
 * Disetel **dari tombol** (`iconPos`), bukan dari ikonnya. Sisi visual diatur CSS `order`
 * (`scss/components/_button.scss`), jadi posisi ikon di markup tidak menentukan hasilnya.
 */
export type WuiButtonIconPos = 'start' | 'end';
