import {
  ChangeDetectionStrategy,
  Component,
  input,
  numberAttribute,
} from '@angular/core';

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
  readonly mode = input<'circular' | 'indeterminate' | 'linear'>('circular');
  readonly size = input<number, number | string>(32, { transform: numberAttribute });
  readonly pos = input<number, number | string>(0, { transform: numberAttribute });
  readonly color = input<string | undefined>(undefined);
}
