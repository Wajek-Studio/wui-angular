import { Component, OnInit, TemplateRef, computed, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  WuiButton,
  WuiIcon,
  WuiPage,
  WuiPageService,
  WuiSidenav,
  WuiSidenavDivider,
  WuiSidenavFull,
  WuiSidenavInner,
  WuiSidenavItem,
  WuiSidenavMini,
  WuiSidenavService,
  WuiSidenavSubheader,
} from '@wajek/wui';

@Component({
  selector: 'app-sidenaav.page',
  imports: [
    RouterLink,
    WuiPage,
    WuiSidenav,
    WuiSidenavInner,
    WuiSidenavMini,
    WuiSidenavFull,
    WuiSidenavItem,
    WuiSidenavDivider,
    WuiSidenavSubheader,
    WuiButton,
    WuiIcon,
  ],
  templateUrl: './sidenaav.page.html',
  styleUrl: './sidenaav.page.scss',
})
export class SidenaavPage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);
  readonly sidenavService: WuiSidenavService = inject(WuiSidenavService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  /** Id untuk live demo playground di dalam halaman */
  readonly demoId = 'playground-sidenav';

  readonly state = computed(() => this.sidenavService.state(this.demoId)());
  readonly isOpen = computed(() => this.sidenavService.isOpen(this.demoId)());
  readonly isMini = computed(() => this.sidenavService.isMini(this.demoId)());
  readonly isClosed = computed(() => this.sidenavService.isClosed(this.demoId)());

  ngOnInit(): void {
    const tpl = this.pageTpl();
    if (tpl) {
      this.pageService.replace(tpl, { variant: 'full' });
    }
    // Pastikan demo sidenav terdaftar dengan state awal open
    this.sidenavService.register(this.demoId, { state: 'open' });
  }

  openDemo(): void {
    this.sidenavService.open(this.demoId);
  }

  miniDemo(): void {
    this.sidenavService.mini(this.demoId);
  }

  closeDemo(): void {
    this.sidenavService.close(this.demoId);
  }

  toggleDemo(): void {
    this.sidenavService.toggle(this.demoId);
  }

  toggleMiniDemo(): void {
    this.sidenavService.toggleMini(this.demoId);
  }
}
