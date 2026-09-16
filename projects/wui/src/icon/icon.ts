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
      [style.width]="computedSize()"
      [style.height]="computedSize()"
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

  /** Preset ukuran (`xs` | `sm` | `md` | `lg` | `xl`) atau nilai CSS bertata ukuran (`1.25rem`). */
  readonly size = input<IconSize>('md');

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

  /** Ukuran siap pakai: preset diubah ke px, nilai CSS lain diteruskan apa adanya. */
  protected readonly computedSize = computed(() => ICON_SIZE_MAP[this.size()] || this.size() || '24px');
}