import { Injector } from '@angular/core';

/**
 * Varian tampilan page.
 *
 * - `full`  — menutup penuh layar
 * - `modal` — transparan + backdrop, bisa ditutup lewat ESC/backdrop
 */
export type WuiPageVariant = 'full' | 'modal';

/** Opsi yang dikirim ke `WuiPageService.push()` / `replace()`. */
export interface WuiPageOptions<C = unknown> {
  /** Varian tampilan. Default `'full'`. */
  variant?: WuiPageVariant;

  /** Context untuk template page (`<ng-template let-x>`). Opsional. */
  context?: C;

  /** Injector tambahan untuk embedded view. Opsional. */
  injector?: Injector;

  /** Id untuk debugging/tracking. Dibuat otomatis kalau tidak diisi. */
  id?: string;
}
