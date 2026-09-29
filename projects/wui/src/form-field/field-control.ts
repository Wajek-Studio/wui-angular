import { WuiFormField } from './form-field';

/**
 * Wiring atribut a11y antara satu kontrol dan `<wui-form-field>`.
 *
 * Dipakai `WuiInput` (kontrol native) **dan** `WuiSelect` (kontrol kustom) — diangkat jadi satu
 * kelas supaya tidak ada dua salinan logika yang harus dijaga sinkron (keputusan **L8** di
 * `docs/planning/wui-select-plan.md`).
 *
 * Yang dikerjakan, semuanya **atribut** (tidak menyentuh nilai):
 * - `id`: memakai id buatan field kalau aplikasi tidak menulis `id` sendiri;
 * - `aria-describedby`: pesan hint/error, **digabung** dengan tautan milik aplikasi;
 * - `aria-invalid="true"` saat field punya `error`;
 * - setiap atribut yang diubah disimpan nilainya semula dan dikembalikan saat kontrol dilepas.
 *
 * Kelas ini bukan service dan tidak memakai DI: ia hidup sepanjang umur directive/komponen
 * pemakainya dan memegang `HTMLElement`-nya langsung.
 */
export class FieldControl {
  readonly #element: HTMLElement;
  readonly #sebelum = new Map<string, string | null>();

  /** `id` yang sudah ditulis aplikasi (kalau ada) — tidak boleh ditimpa. */
  readonly idAplikasi: string | null;

  constructor(element: HTMLElement) {
    this.#element = element;
    this.idAplikasi = element.getAttribute('id');
  }

  /**
   * Pasang `placeholder=" "` kalau aplikasi tidak menulisnya sendiri.
   *
   * **Hanya untuk kontrol native.** Alasan CSS: label mengapung memakai `:placeholder-shown` untuk
   * tahu kontrolnya masih kosong, dan selektor itu tidak pernah cocok kalau atribut `placeholder`
   * tidak ada. Kontrol kustom (select) tidak punya `:placeholder-shown` sama sekali — keadaannya
   * ditandai atribut `data-filled`, jadi jangan panggil method ini untuknya.
   */
  pasangPlaceholderKosong(): void {
    if (!this.#element.hasAttribute('placeholder')) {
      this.set('placeholder', ' ');
    }
  }

  /** Laporkan `id` yang sudah ada di kontrol supaya `for` label menunjuk elemen yang benar. */
  laporkanIdKe(field: WuiFormField): void {
    field.reportControlId(this.idAplikasi);
  }

  /**
   * Sinkronkan id + `aria-describedby` + `aria-invalid` dari field. Idempoten, jadi aman dipanggil
   * ulang dari `effect()` setiap field berubah.
   */
  sinkronDengan(field: WuiFormField): void {
    if (!this.idAplikasi) {
      this.set('id', field.controlId());
    }

    this.setDescribedBy(field.message() ? field.messageId() : null);
    this.set('aria-invalid', field.invalid() ? 'true' : null);
  }

  /** Tulis atribut sambil mengingat nilai aslinya (sekali saja per atribut). */
  set(nama: string, nilai: string | null): void {
    const element = this.#element;

    if (!this.#sebelum.has(nama)) {
      this.#sebelum.set(nama, element.getAttribute(nama));
    }

    if (nilai === null) {
      element.removeAttribute(nama);
    } else {
      element.setAttribute(nama, nilai);
    }
  }

  /**
   * `aria-describedby` digabung dengan milik aplikasi — kalau aplikasi sudah menautkan elemen lain
   * (mis. pesan bantuan khusus), tautan itu tidak boleh hilang.
   */
  setDescribedBy(pesanId: string | null): void {
    if (!this.#sebelum.has('aria-describedby')) {
      this.#sebelum.set('aria-describedby', this.#element.getAttribute('aria-describedby'));
    }

    const asli = (this.#sebelum.get('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    const daftar = pesanId ? [...asli.filter((id) => id !== pesanId), pesanId] : asli;

    if (daftar.length) {
      this.#element.setAttribute('aria-describedby', daftar.join(' '));
    } else {
      this.#element.removeAttribute('aria-describedby');
    }
  }

  /** Kembalikan semua atribut yang diubah wui ke kondisi semula. */
  kembalikan(): void {
    for (const [nama, nilai] of this.#sebelum) {
      if (nilai === null) {
        this.#element.removeAttribute(nama);
      } else {
        this.#element.setAttribute(nama, nilai);
      }
    }

    this.#sebelum.clear();
  }
}
