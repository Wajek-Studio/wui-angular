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
import { Highlight } from 'ngx-highlightjs';

@Component({
  selector: 'app-layout.page',
  imports: [RouterLink, WuiPage, Highlight],
  templateUrl: './layout.page.html',
  styleUrl: './layout.page.scss',
})
export class LayoutPage implements OnInit {
  private readonly pageService: WuiPageService = inject(WuiPageService);

  readonly pageTpl = viewChild<TemplateRef<unknown>>('page');

  readonly containerSnippet = `<!-- Container dengan batas responsif bertingkat -->
<div class="wui-container">
  <h1>Konten Terpusat</h1>
</div>

<!-- Container full-width 100% tanpa batas -->
<div class="wui-container-fluid">
  <h1>Konten Layar Penuh</h1>
</div>`;

  readonly gridBasicSnippet = `<!-- Grid 12-kolom dasar -->
<div class="wui-row wui-gap-3">
  <!-- 2 Kolom Seimbang (6 + 6 = 12) -->
  <div class="wui-col-6">Kolom 1 (6 col)</div>
  <div class="wui-col-6">Kolom 2 (6 col)</div>
</div>

<div class="wui-row wui-gap-3">
  <!-- Asimetris Konten + Sidebar (8 + 4 = 12) -->
  <div class="wui-col-8">Area Konten Utama (8 col)</div>
  <div class="wui-col-4">Sidebar Widget (4 col)</div>
</div>`;

  readonly gridResponsiveSnippet = `<!-- Responsif: 1 kolom di HP, 2 kolom di tablet (md), 4 kolom di desktop (lg) -->
<div class="wui-row wui-gap-3">
  <div class="wui-col-12 wui-col-md-6 wui-col-lg-3">Kartu 1</div>
  <div class="wui-col-12 wui-col-md-6 wui-col-lg-3">Kartu 2</div>
  <div class="wui-col-12 wui-col-md-6 wui-col-lg-3">Kartu 3</div>
  <div class="wui-col-12 wui-col-md-6 wui-col-lg-3">Kartu 4</div>
</div>`;

  readonly gridGapSnippet = `<!-- Gap simetris (baris & kolom sama) -->
<div class="wui-row wui-gap-4">
  <div class="wui-col-6">...</div>
  <div class="wui-col-6">...</div>
</div>

<!-- Jarak horizontal & vertikal independen -->
<div class="wui-row wui-column-gap-4 wui-row-gap-2">
  <div class="wui-col-4">...</div>
  <div class="wui-col-4">...</div>
  <div class="wui-col-4">...</div>
</div>`;

  readonly flexJustifySnippet = `<!-- Perataan horizontal (sumbu utama) -->
<div class="wui-d-flex wui-justify-content-start">...</div>
<div class="wui-d-flex wui-justify-content-center">...</div>
<div class="wui-d-flex wui-justify-content-end">...</div>
<div class="wui-d-flex wui-justify-content-between">...</div>
<div class="wui-d-flex wui-justify-content-around">...</div>
<div class="wui-d-flex wui-justify-content-evenly">...</div>`;

  readonly flexAlignSnippet = `<!-- Perataan vertikal (cross-axis) -->
<div class="wui-d-flex wui-align-items-start">...</div>
<div class="wui-d-flex wui-align-items-center">...</div>
<div class="wui-d-flex wui-align-items-end">...</div>
<div class="wui-d-flex wui-align-items-stretch">...</div>`;

  readonly flexResponsiveSnippet = `<!-- Vertikal (column) di HP, berubah Horizontal (row) di layar tablet ke atas -->
<div class="wui-d-flex wui-flex-column wui-flex-md-row wui-gap-3">
  <div class="wui-flex-fill">Kolom Fleksibel 1</div>
  <div class="wui-flex-fill">Kolom Fleksibel 2</div>
</div>`;

  readonly patternsSnippet = `<!-- Pola 1: Header Bar / Toolbar Interaktif -->
<div class="wui-d-flex wui-justify-content-between wui-align-items-center wui-gap-3">
  <div>
    <h3 class="wui-m-0">Judul Bagian</h3>
    <small>Deskripsi ringkas</small>
  </div>
  <div class="wui-d-flex wui-gap-2">
    <button class="wui-button">Batal</button>
    <button class="wui-button wui-button--primary">Simpan</button>
  </div>
</div>

<!-- Pola 2: Form Multi-kolom Grid -->
<div class="wui-row wui-gap-3">
  <div class="wui-col-12 wui-col-md-6">
    <wui-form-field label="Nama Depan">...</wui-form-field>
  </div>
  <div class="wui-col-12 wui-col-md-6">
    <wui-form-field label="Nama Belakang">...</wui-form-field>
  </div>
</div>`;

  ngOnInit(): void {
    this.pageService.replace(this.pageTpl()!, { variant: 'full' });
  }
}
