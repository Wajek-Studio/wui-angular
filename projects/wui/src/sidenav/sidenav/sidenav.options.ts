/**
 * State tampilan sidenav — nilainya sengaja sama dengan input `state` di `WuiSidenav`.
 * Dipakai string, bukan boolean, supaya mode ringkas (`mini`) tidak butuh flag terpisah.
 */
export type WuiSidenavState =
  /** Terbuka penuh. */
  | 'open'
  /** Tertutup / tersembunyi. */
  | 'close'
  /** Terbuka dalam bentuk ringkas — rail, biasanya hanya ikon. */
  | 'mini';

/** Nilai awal state sidenav. */
export interface WuiSidenavOptions {
  /** Default `'open'` — mengikuti default input `state` di `WuiSidenav`. */
  state?: WuiSidenavState;
}
