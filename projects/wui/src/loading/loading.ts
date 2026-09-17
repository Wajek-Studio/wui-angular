import {
  ChangeDetectionStrategy,
  Component,
  input,
  numberAttribute,
} from '@angular/core';
import { WuiLoadingMode } from './loading.options';

/**
 * Komponen indikator loading Material / WUI.
 *
 * Mendukung tiga mode tampilan:
 * - `circular` (default): Spinner lingkaran SVG dengan animasi rotasi kontinu dan dash stretch.
 * - `indeterminate`: Garis progress bar horizontal kontinu.
 * - `linear`: Garis progress bar horizontal persentase dengan input `pos`.
 *
 * ```html
 * <!-- Mode circular standar (32px) -->
 * <wui-loading mode="circular"></wui-loading>
 *
 * <!-- Mode circular inline di dalam tabel atau di samping teks -->
 * <wui-loading mode="circular" [style.display]="'inline-block'"></wui-loading>
 *
 * <!-- Kustomisasi ukuran dan warna -->
 * <wui-loading mode="circular" [size]="48" color="var(--wui-color-primary)"></wui-loading>
 * ```
 */
@Component({
  selector: 'wui-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    '[class.mode-circular]': "mode() === 'circular'",
    '[class.mode-indeterminate]': "mode() === 'indeterminate'",
    '[class.mode-linear]': "mode() === 'linear'",
    '[class.wui-loading--circular]': "mode() === 'circular'",
    '[class.wui-loading--indeterminate]': "mode() === 'indeterminate'",
    '[class.wui-loading--linear]': "mode() === 'linear'",
    '[style.--wui-loading-size.px]': 'size()',
    '[style.--wui-loading-color]': 'color() || null',
    '[attr.aria-valuenow]': "mode() === 'linear' ? pos() : null",
    '[attr.aria-valuemin]': "mode() === 'linear' ? 0 : null",
    '[attr.aria-valuemax]': "mode() === 'linear' ? 100 : null",
  },
  template: `
    @switch (mode()) {
      @case ('circular') {
        <div class="circular showbox">
          <div class="loader" [style.width.px]="size()" [style.height.px]="size()">
            <svg class="circle" viewBox="25 25 50 50" aria-hidden="true" focusable="false">
              <circle
                class="path"
                cx="50"
                cy="50"
                r="20"
                fill="none"
                stroke-width="4"
                stroke-miterlimit="10"
              />
            </svg>
          </div>
        </div>
      }
      @case ('linear') {
        <div class="linear">
          <div class="pos" [style.width.%]="pos()"></div>
        </div>
      }
      @default {
        <div class="indeterminate"></div>
      }
    }
  `,
})
export class WuiLoading {
  /** Mode tampilan indikator loading (`circular` | `indeterminate` | `linear`). */
  readonly mode = input<WuiLoadingMode>('circular');

  /** Ukuran diameter spinner lingkaran dalam pixel (khusus mode circular, default 32px). */
  readonly size = input<number, number | string>(32, { transform: numberAttribute });

  /** Posisi persentase progres dari 0 hingga 100 (khusus mode linear). */
  readonly pos = input<number, number | string>(0, { transform: numberAttribute });

  /** Warna kustom indikator loading (default mewarisi `--wui-color-primary`). */
  readonly color = input<string | undefined>(undefined);
}
