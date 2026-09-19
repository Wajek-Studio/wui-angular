import { Component, OnDestroy, OnInit, computed, inject, input } from '@angular/core';

import { WuiSidenavState } from './sidenav.options';
import { WuiSidenavService } from './sidenav.service';

/**
 * Sidenav.
 *
 * Komponen ini **tidak menyimpan state-nya sendiri**. State dipegang `WuiSidenavService` dengan
 * kunci `id`, sehingga:
 *
 * - perubahan dari mana pun — mis. tombol di header — langsung terasa di sini,
 * - beberapa sidenav bisa hidup berdampingan tanpa saling mengganggu.
 *
 * ```html
 * <wui-sidenav id="menu-utama">…</wui-sidenav>
 * <wui-sidenav id="panel-filter" initialState="mini">…</wui-sidenav>
 * ```
 *
 * ```ts
 * this.sidenav.toggle('menu-utama');   // hanya mengubah menu-utama
 * ```
 */
@Component({
  selector: 'wui-sidenav',
  imports: [],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
  host: {
    // Class state dipasang di host element. Inilah yang dibaca style layer
    // (`scss/components/_sidenav.scss`) untuk mengatur lebar.
    class: 'wui-sidenav',
    '[class.is-open]': 'isOpen()',
    '[class.is-mini]': 'isMini()',
    '[class.is-closed]': 'isClosed()',
  },
})
export class WuiSidenav implements OnInit, OnDestroy {
  /** Id unik sidenav ini — jadi kunci state di `WuiSidenavService`. */
  readonly id = input.required<string>();

  /** State awal saat didaftarkan. Setelah itu state dikelola service; input ini tidak dipakai lagi. */
  readonly initialState = input<WuiSidenavState>('open');

  private readonly sidenav = inject(WuiSidenavService);

  /** State terkini milik sidenav ini — dibaca reaktif dari service berdasarkan `id`. */
  readonly state = computed(() => this.sidenav.state(this.id())());

  /** Turunan yang enak dipakai di template maupun class binding. */
  readonly isOpen = computed(() => this.state() === 'open');
  readonly isMini = computed(() => this.state() === 'mini');
  readonly isClosed = computed(() => this.state() === 'close');
  readonly isVisible = computed(() => this.state() !== 'close');

  ngOnInit(): void {
    this.sidenav.register(this.id(), { state: this.initialState() });
  }

  ngOnDestroy(): void {
    this.sidenav.unregister(this.id());
  }
}
