import { Component, OnInit, TemplateRef, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WuiPage, WuiPageService } from '@wajek/wui';

/**
 * Halaman demo primitif layout — sekarang berisi **container** (`scss/layout/_container.scss`).
 *
 * Halaman ini sengaja hampir tanpa logika: yang diperagakan adalah CSS (lebar maksimum yang
 * berpindah per breakpoint), dan pembacaan breakpoint di halaman ini pun CSS murni — tidak ada
 * listener `resize`, supaya halaman tidak perlu tahu apa-apa soal lebar jendela.
 *
 * Belum ada: `stack` dan `grid` (baris/kolom). Container duluan karena grid memakai gutter-nya.
 */
@Component({
  selector: 'app-layout.page',
  imports: [RouterLink, WuiPage],
  templateUrl: './layout.page.html',
  styleUrl: './layout.page.scss',
})
export class LayoutPage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });
  }
}
