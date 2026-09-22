import { OverlayRef } from '@angular/cdk/overlay';

/**
 * Pengukur kecil untuk spike F0 — **kode sekali pakai**, bukan bagian library.
 *
 * Semua fungsi menerima elemen langsung supaya bisa dipanggil dari komponen mana pun
 * (halaman spike maupun dialog) dan hasilnya berupa teks siap tempel ke log.
 */

/** Elemen isi panel di dalam pane overlay. */
export function panelDari(ref: OverlayRef): HTMLElement | null {
  return ref.overlayElement.querySelector<HTMLElement>('.spike-isi');
}

/** Kotak elemen dalam bentuk `left,top lebar×tinggi`. */
export function rect(el: Element): string {
  const r = el.getBoundingClientRect();

  return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)}`;
}

/** `z-index` terhitung (string `auto` bila tidak diset). */
export function zIndexOf(el: Element | null): string {
  return el ? getComputedStyle(el).zIndex : '-';
}

/** Elemen yang sedang fokus, dalam bentuk ringkas untuk log. */
export function activeDesc(): string {
  const el = document.activeElement;

  if (!el) {
    return 'null';
  }

  const cls = typeof el.className === 'string' && el.className ? `.${el.className.split(' ').join('.')}` : '';
  const tanda = el === document.body ? ' (body)' : '';

  return `${el.tagName.toLowerCase()}${cls}${tanda}`;
}

/**
 * Hit-test pada titik panel (koordinat fraksional 0–1 dari kotak panel).
 *
 * Inilah cara membuktikan dua hal sekaligus: panel tidak terpotong (titik di luar induk tetap
 * menerima panel) dan panel tidak tertutup lapisan lain (backdrop dialog, pane dialog).
 */
export function hitPada(panel: HTMLElement, fx: number, fy: number): string {
  const r = panel.getBoundingClientRect();
  const x = Math.round(Math.min(Math.max(r.left + r.width * fx, 1), window.innerWidth - 2));
  const y = Math.round(Math.min(Math.max(r.top + r.height * fy, 1), window.innerHeight - 2));
  const el = document.elementFromPoint(x, y);

  if (!el) {
    return 'titik di luar jendela';
  }

  if (panel.contains(el)) {
    return 'PANEL';
  }

  const cls = typeof el.className === 'string' ? el.className : '';

  return `tertutup <${el.tagName.toLowerCase()} class="${cls}">`;
}

/** Apakah pane benar-benar hidup di container overlay CDK (bukan di dalam induk asalnya)? */
export function diContainerCdk(pane: Element): boolean {
  return !!pane.closest('.cdk-overlay-container');
}

/**
 * Urutan pane di dalam `.cdk-overlay-container` — di dalam satu container, urutan DOM ikut
 * menentukan siapa yang tampak di atas saat `z-index` sama.
 */
export function urutanContainer(pane: HTMLElement, paneLain: HTMLElement | null): string {
  const container = pane.closest('.cdk-overlay-container');

  if (!container) {
    return 'container CDK tidak ditemukan';
  }

  const wrappers = [...container.children];
  const idxKita = wrappers.findIndex((w) => w.contains(pane));
  const idxLain = paneLain ? wrappers.findIndex((w) => w.contains(paneLain)) : -1;

  return `container z=${zIndexOf(container)} · wrapper pane ini=${idxKita}, pane lain=${idxLain} dari ${wrappers.length}`;
}
