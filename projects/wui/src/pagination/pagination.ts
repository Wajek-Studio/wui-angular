import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { WuiButton } from '../button/button';
import { WuiButtonSize } from '../button/button.options';
import { WuiIcon } from '../icon/icon';
import { WuiPaginationInfo } from './pagination.options';

const DEFAULT_PAGINATION_ICONS = {
  first: 'M18.41,16.59L13.82,12L18.41,7.41L17,6L11,12L17,18L18.41,16.59M6,6H8V18H6V6Z',
  prev: 'M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z',
  next: 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z',
  last: 'M5.59,7.41L10.18,12L5.59,16.59L7,18L13,12L7,6L5.59,7.41M16,6H18V18H16V6Z',
} as const;

/**
 * Komponen pagination mandiri untuk navigasi tabel dan daftar data.
 *
 * Menggantikan pola pagination yang sebelumnya diduplikasi di setiap halaman:
 * - Menyediakan 4 tombol navigasi (`first`, `prev`, `next`, `last`) dengan tombol `wuiButton size="sm" iconOnly variant="text"`.
 * - Menghitung rentang data aktif secara otomatis (`1 - 10 dari 100 baris`).
 * - Terintegrasi dengan signal Angular 20 dan two-way binding `[(page)]`.
 * - Built-in SVG path fallback untuk 4 ikon navigasi sehingga langsung berfungsi tanpa konfigurasi tambahan.
 *
 * ```html
 * <wui-pagination
 *   [(page)]="currentPage"
 *   [count]="totalItems()"
 *   [limit]="pageSize()"
 *   [loading]="isLoading()"
 *   (pageChange)="loadData()"
 * />
 * ```
 */
@Component({
  selector: 'wui-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WuiButton, WuiIcon],
  host: {
    '[class.wui-pagination--full]': 'fullWidth()',
  },
  template: `
    <nav class="wui-pagination" [class.wui-pagination--full]="fullWidth()" role="navigation" aria-label="Navigasi Halaman">
      <button
        wuiButton
        [size]="buttonSize()"
        iconOnly
        variant="text"
        [disabled]="!canPrev()"
        (click)="first()"
        aria-label="Halaman pertama"
      >
        <wui-icon icon="page-first" [path]="iconPaths.first" />
      </button>

      <button
        wuiButton
        [size]="buttonSize()"
        iconOnly
        variant="text"
        [disabled]="!canPrev()"
        (click)="prev()"
        aria-label="Halaman sebelumnya"
      >
        <wui-icon icon="chevron-left" [path]="iconPaths.prev" />
      </button>

      <div class="wui-pagination-label">
        @if (loading()) {
          <span>{{ loadingText() }}</span>
        } @else if (count() === 0) {
          <span>{{ emptyText() }}</span>
        } @else {
          <span>{{ displayText() }}</span>
        }
      </div>

      <button
        wuiButton
        [size]="buttonSize()"
        iconOnly
        variant="text"
        [disabled]="!canNext()"
        (click)="next()"
        aria-label="Halaman berikutnya"
      >
        <wui-icon icon="chevron-right" [path]="iconPaths.next" />
      </button>

      <button
        wuiButton
        [size]="buttonSize()"
        iconOnly
        variant="text"
        [disabled]="!canNext()"
        (click)="last()"
        aria-label="Halaman terakhir"
      >
        <wui-icon icon="page-last" [path]="iconPaths.last" />
      </button>
    </nav>
  `,
})
export class WuiPagination {
  protected readonly iconPaths = DEFAULT_PAGINATION_ICONS;

  /** Nomor halaman aktif saat ini (1-indexed). Mendukung two-way binding `[(page)]`. */
  readonly page = model<number>(1);

  /** Total seluruh baris data. */
  readonly count = input<number, number | string>(0, { transform: numberAttribute });

  /** Jumlah baris data per halaman. */
  readonly limit = input<number, number | string>(10, { transform: numberAttribute });

  /** Status pemuatan data. Jika true, tombol dinonaktifkan sementara dan teks loadingText dimunculkan. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Menonaktifkan seluruh tombol navigasi. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Teks saat data sedang dimuat. */
  readonly loadingText = input('Memuat...');

  /** Teks saat data kosong (count = 0). */
  readonly emptyText = input('0 baris');

  /** Ukuran tombol ikon navigasi (default 'sm' = 32px x 32px). */
  readonly buttonSize = input<WuiButtonSize>('sm');

  /** Apakah pagination melebar penuh (space-between) di kontainer. Default false (compact di kiri). */
  readonly fullWidth = input(false, { transform: booleanAttribute });

  /** Callback opsional untuk kustomisasi format teks label rentang data. */
  readonly labelFormat = input<((info: WuiPaginationInfo) => string) | undefined>(undefined);

  /** Jumlah total halaman yang tersedia. */
  readonly pageCount = computed(() => {
    const limitVal = Math.max(1, this.limit());
    const countVal = this.count();
    return Math.max(1, Math.ceil(countVal / limitVal));
  });

  /** Nilai offset baris data awal untuk halaman aktif. */
  readonly offset = computed(() => {
    const pageVal = Math.max(1, this.page());
    const limitVal = Math.max(1, this.limit());
    return (pageVal - 1) * limitVal;
  });

  /** Nomor urut baris awal yang sedang ditampilkan. */
  readonly from = computed(() => {
    return this.count() === 0 ? 0 : this.offset() + 1;
  });

  /** Nomor urut baris akhir yang sedang ditampilkan. */
  readonly to = computed(() => {
    return Math.min(this.count(), this.offset() + Math.max(1, this.limit()));
  });

  /** Status apakah tombol navigasi mundur (First & Prev) dapat diklik. */
  readonly canPrev = computed(() => {
    return !this.disabled() && !this.loading() && this.count() > 0 && this.page() > 1;
  });

  /** Status apakah tombol navigasi maju (Next & Last) dapat diklik. */
  readonly canNext = computed(() => {
    return !this.disabled() && !this.loading() && this.count() > 0 && this.page() < this.pageCount();
  });

  /** Objek ringkasan pagination untuk kebutuhan format teks. */
  readonly info = computed<WuiPaginationInfo>(() => ({
    page: this.page(),
    pageCount: this.pageCount(),
    offset: this.offset(),
    from: this.from(),
    to: this.to(),
    count: this.count(),
    limit: this.limit(),
  }));

  /** Teks label yang ditampilkan di tengah kontrol pagination. */
  protected readonly displayText = computed(() => {
    const custom = this.labelFormat();
    if (custom) {
      return custom(this.info());
    }
    const countFormatted = new Intl.NumberFormat('id-ID').format(this.count());
    return `${this.from()} - ${this.to()} dari ${countFormatted} baris`;
  });

  first(): void {
    if (this.canPrev()) {
      this.goTo(1);
    }
  }

  prev(): void {
    if (this.canPrev()) {
      this.goTo(this.page() - 1);
    }
  }

  next(): void {
    if (this.canNext()) {
      this.goTo(this.page() + 1);
    }
  }

  last(): void {
    if (this.canNext()) {
      this.goTo(this.pageCount());
    }
  }

  goTo(targetPage: number): void {
    const clamped = Math.max(1, Math.min(this.pageCount(), targetPage));
    if (clamped !== this.page()) {
      this.page.set(clamped);
    }
  }
}
