#!/usr/bin/env node
/**
 * wui-theme.mjs — mengubah export Material Theme Builder (MTB) menjadi berkas SCSS `$wui-schemes`.
 *
 * Hasilnya dipakai aplikasi lewat konfigurasi berikut di `src/styles.scss`:
 *
 *   @use './theme/wui-schemes' as theme;
 *   @use '@wajek/wui/scss/wui.scss' with ($wui-schemes: theme.$wui-schemes);
 *
 * Nilai diambil apa adanya dari `schemes` MTB — **bukan** dihitung ulang dari `palettes` — karena
 * skema MTB sudah disesuaikan untuk kontras (bukti: `light.primary` `#904A43` ≠ palet `primary`
 * tone 40 `#8E4B44`). Lihat M1 di `docs/planning/wui-color-mtb-plan.md`.
 *
 * `palettes` tetap ikut ditulis sebagai `$wui-palletes`: data rujukan yang **tidak** dipakai library
 * (M6), gunanya dokumentasi & pemetaan balik ke MTB.
 *
 * Skrip ini ikut terbit bersama paket (`projects/wui/bin/wui-theme.mjs`, didaftarkan lewat field `bin`),
 * jadi aplikasi konsumen tidak perlu menyalin apa pun:
 *
 *   npx wui-theme src/theme/material-theme.json     # dari root aplikasi konsumen
 *   npm run theme:build                             # dari repo library ini (lihat package.json)
 *
 * Semua path dihitung dari **direktori kerja** (`process.cwd()`), bukan dari lokasi skrip.
 *
 * Contoh:
 *   npx wui-theme src/theme/material-theme.json
 *   npx wui-theme src/theme/material-theme.json --check
 *   npx wui-theme ~/Downloads/default.json -o src/theme/_wui-schemes.scss
 *   npx wui-theme material-theme.json --unknown=warn
 *
 * Kode keluar: 0 = berhasil/sinkron · 1 = gagal (argumen/JSON/peran) · 2 = `--check` menemukan berkas
 * basi atau belum ada.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

/* ── Konfigurasi ────────────────────────────────────────────────────────── */

/**
 * Patokan path = **direktori kerja**, karena skrip ini berjalan di root aplikasi konsumen
 * (`npx wui-theme`) maupun di root repo library (`npm run theme:build`).
 */
const CWD = process.cwd();

/** Berkas input bawaan (relatif direktori kerja). */
const SUMBER_BAWAAN = 'src/theme/material-theme.json';

/** Skema yang dipakai tahap ini. Varian kontras MTB (4 skema) ditunda — lihat M5. */
const SKEMA_PAKAI = ['light', 'dark'];

/**
 * Peran M3 yang ditulis ke `$wui-schemes`, dikelompokkan seperti urutan Material Theme Builder.
 * Kunci ditulis camelCase seperti di JSON; `toKebab()` yang mengubahnya jadi nama peran kita.
 * Menambah/mengurangi peran cukup di sini — urutan berkas generated mengikuti daftar ini.
 */
const GRUP_PERAN = [
  { nama: 'primary', kunci: ['primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer'] },
  {
    nama: 'secondary',
    kunci: ['secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer'],
  },
  {
    nama: 'tertiary',
    kunci: ['tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer'],
  },
  { nama: 'error', kunci: ['error', 'onError', 'errorContainer', 'onErrorContainer'] },
  {
    nama: 'surface',
    kunci: [
      'surface',
      'onSurface',
      'onSurfaceVariant',
      'surfaceDim',
      'surfaceBright',
      'surfaceContainerLowest',
      'surfaceContainerLow',
      'surfaceContainer',
      'surfaceContainerHigh',
      'surfaceContainerHighest',
    ],
  },
  { nama: 'outline', kunci: ['outline', 'outlineVariant'] },
  { nama: 'inverse', kunci: ['inverseSurface', 'inverseOnSurface', 'inversePrimary'] },
  { nama: 'netral murni', kunci: ['shadow', 'scrim'] },
  {
    nama: 'fixed accent',
    kunci: [
      'primaryFixed',
      'onPrimaryFixed',
      'primaryFixedDim',
      'onPrimaryFixedVariant',
      'secondaryFixed',
      'onSecondaryFixed',
      'secondaryFixedDim',
      'onSecondaryFixedVariant',
      'tertiaryFixed',
      'onTertiaryFixed',
      'tertiaryFixedDim',
      'onTertiaryFixedVariant',
    ],
  },
];

/** Kunci MTB yang sengaja dilewati karena sudah deprecated di M3 (K3). */
const KUNCI_DILEWATI = {
  background: 'deprecated M3 — pakai surface',
  onBackground: 'deprecated M3 — pakai onSurface',
  surfaceVariant: 'deprecated M3 — pakai surfaceContainerHighest',
  surfaceTint: 'deprecated M3 — elevasi M3 tidak lagi memakai tint',
};

/** Jumlah tone per baris di `$wui-palletes` — berkasnya jadi lebih ringkas tapi tetap mudah di-diff. */
const TONE_PER_BARIS = 6;

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const tty = process.stdout.isTTY;
const paint = (code) => (teks) => (tty ? `\u001b[${code}m${teks}\u001b[0m` : teks);
const bold = paint('1');
const dim = paint('2');
const red = paint('31');
const green = paint('32');
const yellow = paint('33');
const cyan = paint('36');

/* ── Utilitas ───────────────────────────────────────────────────────────── */

/** `onPrimaryContainer` → `on-primary-container`. Satu-satunya aturan transformasi kunci (M1). */
function toKebab(kunci) {
  return kunci.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** `#FFFFFF` → `#fff`, `#000000` → `#000` — wajib, karena lint memakai `color-hex-length: short`. */
function normalkanHex(nilai, konteks) {
  const teks = String(nilai).trim();

  if (!HEX_RE.test(teks)) {
    throw new Error(`${konteks}: "${nilai}" bukan warna heksadesimal (#rgb atau #rrggbb).`);
  }

  const digit = teks.slice(1).toLowerCase();
  const bisaDipendekkan =
    digit.length === 6 &&
    digit[0] === digit[1] &&
    digit[2] === digit[3] &&
    digit[4] === digit[5];

  return bisaDipendekkan ? `#${digit[0]}${digit[2]}${digit[4]}` : `#${digit}`;
}

/** Path relatif ke direktori kerja untuk pesan & header (selalu pakai garis miring `/`). */
function rel(path) {
  return relative(CWD, path).split('\\').join('/');
}

/**
 * Cara skrip ini dipanggil — dipakai di header `Regenerate` supaya perintah di berkas generated bisa
 * langsung di-copy-paste, baik dari aplikasi konsumen (npx/node_modules) maupun dari repo library.
 */
const PERINTAH_SKRIP = `node ${rel(resolve(process.argv[1] ?? 'node_modules/@wajek/wui/bin/wui-theme.mjs'))}`;

/** Nomor baris pertama yang berbeda antara dua berkas (1-based) — untuk pesan `--check`. */
function barisPertamaBeda(lama, baru) {
  const a = lama.split('\n');
  const b = baru.split('\n');

  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) {
      return i + 1;
    }
  }

  return 1;
}

/* ── Argumen ────────────────────────────────────────────────────────────── */

function parseArgumen(argv) {
  const opsi = {
    masuk: SUMBER_BAWAAN,
    keluar: null,
    check: false,
    unknown: 'error',
    tenang: false,
    bantuan: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      opsi.bantuan = true;
      continue;
    }

    if (arg === '--check') {
      opsi.check = true;
      continue;
    }

    if (arg === '-q' || arg === '--quiet') {
      opsi.tenang = true;
      continue;
    }

    if (arg === '-o' || arg === '--out') {
      const nilai = argv[i + 1];

      if (!nilai || nilai.startsWith('-')) {
        throw new Error('Opsi `--out` butuh path berkas, mis. `--out src/theme/_wui-schemes.scss`.');
      }

      opsi.keluar = nilai;
      i += 1;
      continue;
    }

    if (arg.startsWith('--out=')) {
      opsi.keluar = arg.slice('--out='.length);
      continue;
    }

    if (arg.startsWith('--unknown=')) {
      const nilai = arg.slice('--unknown='.length);

      if (nilai !== 'error' && nilai !== 'warn') {
        throw new Error('`--unknown` hanya menerima `error` (bawaan) atau `warn`.');
      }

      opsi.unknown = nilai;
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Opsi "${arg}" tidak dikenal. Jalankan dengan --help untuk daftar opsinya.`);
    }

    opsi.masuk = arg;
  }

  return opsi;
}

function cetakBantuan() {
  console.log(`${bold('wui-theme.mjs')} — export Material Theme Builder → \`$wui-schemes\` (SCSS)

  ${bold('Pemakaian')}
    npx wui-theme [input.json] [opsi]                       # aplikasi konsumen
    node node_modules/@wajek/wui/bin/wui-theme.mjs [input] [opsi]
    node projects/wui/bin/wui-theme.mjs [input] [opsi]      # dari repo library ini

  ${bold('Argumen')}
    input.json          berkas export MTB (bawaan: ${SUMBER_BAWAAN})

  ${bold('Opsi')}
    -o, --out <file>    berkas keluaran (bawaan: <folder input>/_wui-schemes.scss)
        --check         bandingkan saja, tidak menulis; keluar 2 bila basi/belum ada
        --unknown=error | warn    sikap untuk kunci skema yang tidak dikenal (bawaan: error)
    -q, --quiet         sembunyikan catatan (peringatan tetap tampil)
    -h, --help          tampilkan bantuan ini

  ${bold('Kode keluar')}
    0 berhasil / sinkron · 1 gagal · 2 --check menemukan berkas basi atau belum ada`);
}

/* ── Pembentukan berkas ─────────────────────────────────────────────────── */

function label(nama, nilai) {
  return `// ${nama.padEnd(10)}: ${nilai}`;
}

/** Header jejak: dari mana berkas ini datang, dengan angka apa, dan bagaimana mengulanginya. */
function buatHeader({ json, hash, sumberRel, perintah, laporan }) {
  const baris = [
    '// =============================================================================',
    '// GENERATED — JANGAN DIEDIT TANGAN.',
    label('Sumber', sumberRel),
  ];

  const deskripsi = String(json.description ?? '')
    .split('\n')
    .map((teks) => teks.trim())
    .filter(Boolean);

  deskripsi.forEach((teks, urutan) => {
    baris.push(urutan === 0 ? label('Label', teks) : `// ${' '.repeat(12)}${teks}`);
  });

  if (json.seed) {
    baris.push(label('Seed', String(json.seed).toLowerCase()));
  }

  baris.push(label('Sha256', hash));

  const jumlahPakai = SKEMA_PAKAI.length;
  const jumlahTotal = laporan.skemaTotal;
  const catatanSkema =
    jumlahTotal > jumlahPakai
      ? ` — ${jumlahPakai} dari ${jumlahTotal} skema; varian kontras menyusul (M5)`
      : '';

  baris.push(label('Skema', `${SKEMA_PAKAI.join(', ')}${catatanSkema}`));

  if (laporan.dilewati.size > 0) {
    const daftar = [...laporan.dilewati].sort().join(', ');
    baris.push(label('Dilewati', `${daftar} — deprecated M3`));
  }

  baris.push(label('Alat', '@wajek/wui · bin/wui-theme.mjs'));
  baris.push(label('Regenerate', perintah));
  baris.push('// =============================================================================');

  return baris.join('\n');
}

/** Satu skema (`'light'` / `'dark'`) beserta peran-perannya. */
function blokSatuSkema(nama, nilai, opsi, laporan) {
  if (!nilai || typeof nilai !== 'object') {
    throw new Error(`Skema "${nama}" tidak ada atau bukan objek di berkas export MTB.`);
  }

  const terpakai = new Set();
  const grupTeks = [];

  for (const grup of GRUP_PERAN) {
    const entri = [];

    for (const kunci of grup.kunci) {
      if (!Object.hasOwn(nilai, kunci)) {
        throw new Error(
          `Skema "${nama}" tidak punya kunci "${kunci}" (peran '${toKebab(kunci)}'). ` +
            'Export MTB biasanya lengkap — periksa berkas JSON-nya.',
        );
      }

      const hex = normalkanHex(nilai[kunci], `skema ${nama} · ${kunci}`);

      entri.push(`    '${toKebab(kunci)}': ${hex},`);
      terpakai.add(kunci);
      laporan.jumlahPeran += 1;
    }

    grupTeks.push(entri.join('\n'));
  }

  const takDikenalSkema = Object.keys(nilai).filter(
    (kunci) => !terpakai.has(kunci) && !Object.hasOwn(KUNCI_DILEWATI, kunci),
  );

  for (const kunci of Object.keys(nilai)) {
    if (!terpakai.has(kunci) && Object.hasOwn(KUNCI_DILEWATI, kunci)) {
      laporan.dilewati.add(kunci);
    }
  }

  if (takDikenalSkema.length > 0) {
    laporan.takDikenal.push(...takDikenalSkema);

    if (opsi.unknown !== 'warn') {
      throw new Error(
        `Skema "${nama}" punya kunci yang tidak dikenal: ${takDikenalSkema.join(', ')}.\n` +
          'Kalau ini kunci baru dari versi MTB terbaru, jalankan lagi dengan `--unknown=warn` untuk ' +
          'melihat daftarnya, lalu pastikan versi `@wajek/wui` sudah yang terbaru (daftar peran ada di ' +
          'bin/wui-theme.mjs di dalam paket).',
      );
    }
  }

  return `  '${nama}': (\n${grupTeks.join('\n\n')}\n  ),`;
}

/** Skala tone mentah dari `palettes` — data rujukan, tidak dipakai library (M6). */
function blokPalet(json, laporan) {
  const palettes = json.palettes;

  if (!palettes || typeof palettes !== 'object' || Object.keys(palettes).length === 0) {
    return null;
  }

  const blok = [];

  for (const [nama, palletes] of Object.entries(palettes)) {
    const kunci = Object.keys(palletes)
      .map((tone) => {
        const angka = Number(tone);

        if (!Number.isInteger(angka)) {
          throw new Error(`Palet "${nama}" punya tone non-numerik: "${tone}".`);
        }

        return angka;
      })
      .sort((a, b) => a - b);

    const nilai = kunci.map(
      (tone) => `${tone}: ${normalkanHex(palletes[String(tone)], `palet ${nama} · tone ${tone}`)}`,
    );
    const baris = [];

    for (let i = 0; i < nilai.length; i += TONE_PER_BARIS) {
      baris.push(`    ${nilai.slice(i, i + TONE_PER_BARIS).join(', ')},`);
    }

    blok.push(`  '${nama}': (\n${baris.join('\n')}\n  ),`);
    laporan.jumlahPalet += 1;
    laporan.jumlahTone += kunci.length;
  }

  return `$wui-palletes: (\n${blok.join('\n')}\n);`;
}

function bangunBerkas({ json, hash, sumberRel, perintah, opsi }) {
  const laporan = {
    skemaTotal: Object.keys(json.schemes ?? {}).length,
    jumlahPeran: 0,
    jumlahPalet: 0,
    jumlahTone: 0,
    dilewati: new Set(),
    takDikenal: [],
  };

  const skema = SKEMA_PAKAI.map((nama) => blokSatuSkema(nama, json.schemes?.[nama], opsi, laporan));
  const palletes = blokPalet(json, laporan);

  const bagian = [
    buatHeader({ json, hash, sumberRel, perintah, laporan }),
    '',
    `$wui-schemes: (\n${skema.join('\n\n')}\n);`,
  ];

  if (palletes) {
    bagian.push(
      '',
      '// Skala tone mentah dari `palettes` — DATA RUJUKAN, tidak dipakai library (M6).',
      '// Mode tidak perlu dipisah: tone MTB absolut (0 = hitam, 100 = putih) untuk kedua mode.',
      palletes,
    );
  }

  return { teks: `${bagian.join('\n')}\n`, laporan };
}

/* ── Program utama ──────────────────────────────────────────────────────── */

function perintahUntuk({ sumberRel, keluarRel, opsi }) {
  const bagian = [PERINTAH_SKRIP, sumberRel];

  if (opsi.keluar) {
    bagian.push('-o', keluarRel);
  }

  if (opsi.unknown !== 'error') {
    bagian.push(`--unknown=${opsi.unknown}`);
  }

  return bagian.join(' ');
}

function jalankan(argv) {
  const opsi = parseArgumen(argv);

  if (opsi.bantuan) {
    cetakBantuan();

    return 0;
  }

  const sumber = resolve(CWD, opsi.masuk);

  if (!existsSync(sumber)) {
    throw new Error(
      `Berkas sumber tidak ada: ${rel(sumber)}\n` +
        'Ekspor dulu dari Material Theme Builder, mis. simpan JSON-nya di src/theme/material-theme.json.',
    );
  }

  const mentah = readFileSync(sumber, 'utf8');
  let json;

  try {
    json = JSON.parse(mentah);
  } catch (err) {
    throw new Error(`${rel(sumber)} bukan JSON yang valid: ${err.message}`);
  }

  if (!json.schemes || typeof json.schemes !== 'object') {
    throw new Error(
      `${rel(sumber)} tidak punya objek "schemes" — sepertinya bukan export Material Theme Builder.`,
    );
  }

  const keluar = resolve(CWD, opsi.keluar ?? join(dirname(opsi.masuk), '_wui-schemes.scss'));
  const sumberRel = rel(sumber);
  const keluarRel = rel(keluar);
  const hash = createHash('sha256').update(mentah).digest('hex');
  const perintah = perintahUntuk({ sumberRel, keluarRel, opsi });
  const { teks, laporan } = bangunBerkas({ json, hash, sumberRel, perintah, opsi });

  if (opsi.check) {
    if (!existsSync(keluar)) {
      console.error(`${yellow('!')} ${keluarRel} belum ada — jalankan tanpa --check untuk membuatnya.`);

      return 2;
    }

    const lama = readFileSync(keluar, 'utf8');

    if (lama === teks) {
      console.log(`${green('✔')} ${keluarRel} sinkron dengan ${sumberRel} (sha256 ${hash.slice(0, 12)}…).`);

      return 0;
    }

    console.error(
      `${yellow('!')} ${keluarRel} BASI (beda di baris ${barisPertamaBeda(lama, teks)} dari ${sumberRel}).\n` +
        `  Perbarui dengan: ${perintah}`,
    );

    return 2;
  }

  if (keluarRel.startsWith('..')) {
    console.error(
      `${yellow('!')} Keluaran berada di luar direktori kerja (${keluarRel}). ` +
        'Pakai `-o` bila berkasnya memang mau ditaruh di dalam proyek.',
    );
  }

  mkdirSync(dirname(keluar), { recursive: true });
  writeFileSync(keluar, teks, 'utf8');

  console.log(
    `${green('✔')} ${keluarRel} ditulis — ${SKEMA_PAKAI.length} skema × ` +
      `${laporan.jumlahPeran / SKEMA_PAKAI.length} peran` +
      (laporan.jumlahPalet > 0
        ? `, ${laporan.jumlahPalet} palet × ${laporan.jumlahTone / laporan.jumlahPalet} tone`
        : '') +
      '.',
  );

  if (!opsi.tenang) {
    if (laporan.dilewati.size > 0) {
      console.error(
        `${cyan('ℹ')} ${laporan.dilewati.size} kunci deprecated dilewati: ${[...laporan.dilewati].sort().join(', ')}.`,
      );
    }

    if (laporan.takDikenal.length > 0) {
      console.error(
        `${yellow('!')} kunci tidak dikenal dilewati: ${[...new Set(laporan.takDikenal)].join(', ')}.`,
      );
    }

    const skemaLain = Object.keys(json.schemes).filter((nama) => !SKEMA_PAKAI.includes(nama));

    if (skemaLain.length > 0) {
      console.error(`${dim(`ℹ ${skemaLain.length} skema lain di JSON belum dipakai: ${skemaLain.join(', ')}.`)}`);
    }
  }

  return 0;
}

try {
  process.exitCode = jalankan(process.argv.slice(2));
} catch (err) {
  console.error(`${red('✖')} ${err.message}`);
  process.exitCode = 1;
}
