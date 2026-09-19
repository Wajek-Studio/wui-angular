import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IconService } from './icon.service';
import { ICON_SIZE_MAP, IconSize } from './icon.model';

@Component({
  selector: 'wui-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      [style.width]="inlineSize()"
      [style.height]="inlineSize()"
      [style.color]="color() || null">
      @if (pathData()) {
        <path [attr.d]="pathData()" />
      }
    </svg>
  `,
  styleUrl: './icon.scss',
})
export class WuiIcon {
  private readonly registry = inject(IconService);

  /**
   * Nama ikon yang didaftarkan lewat `provideIcons()`.
   * ```html
   * <wui-icon icon="home" />
   * ```
   */
  readonly icon = input<string | undefined>(undefined);

  /** Path `d` mentah untuk ikon sekali pakai. Bila diisi, `icon`/`name` diabaikan. */
  readonly path = input<string | undefined>(undefined);

  /**
   * Preset ukuran (`xs` | `sm` | `md` | `lg` | `xl`) atau nilai CSS bertata ukuran (`1.25rem`).
   * Bila tidak diisi, ikon mengikuti `--wui-icon-size` dari elemen induknya (dipakai tombol),
   * dengan 24px sebagai fallback terakhir.
   */
  readonly size = input<IconSize | undefined>(undefined);

  /** Warna ikon. Bila kosong, ikon mengikuti `color` elemen induknya. */
  readonly color = input<string | undefined>(undefined);

  /** Data path yang dipakai template — path langsung menang atas lookup registry. */
  protected readonly pathData = computed(() => {
    const direct = this.path();

    if (direct) {
      return direct;
    }

    const iconName = this.icon();

    return iconName ? this.registry.getIcon(iconName) : undefined;
  });

  /**
   * Ukuran inline — hanya diisi bila `size` ditulis eksplisit.
   *
   * Bila kosong, ukuran datang dari CSS (`width: var(--wui-icon-size, 24px)` di `icon.scss`),
   * sehingga container seperti tombol bisa mengatur ukuran ikon lewat `--wui-icon-size`
   * tanpa ditimpa inline style.
   */
  protected readonly inlineSize = computed(() => {
    const size = this.size();

    return size ? ICON_SIZE_MAP[size] || size : null;
  });
}