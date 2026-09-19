#!/usr/bin/env node
/**
 * bump-version.mjs — menaikkan versi paket library (`@wajek/wui`).
 *
 * Hanya menyentuh field `"version"` di manifest (tidak mem-format ulang JSON),
 * jadi diff-nya satu baris saja. Pembacaan/penulisan manifest dilakukan di Node,
 * bukan shell, supaya skrip jalan sama di host maupun di container (yang hanya punya `sh`).
 *
 * Contoh:
 *   node scripts/bump-version.mjs patch                  # 20.0.0 -> 20.0.1
 *   node scripts/bump-version.mjs minor --dry-run        # lihat hasil, tidak menulis
 *   node scripts/bump-version.mjs premajor --preid beta  # 20.0.0 -> 21.0.0-beta.0
 *   node scripts/bump-version.mjs 21.0.0 --commit --tag --push
 *   node scripts/bump-version.mjs major --sync-peers     # sekalian samakan peer @angular/*
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/* ── Konfigurasi ────────────────────────────────────────────────────────── */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Manifest yang ikut dinaikkan. Tambahkan entri di sini bila nanti ada paket/paket lain. */
const MANIFESTS = [{ file: 'projects/wui/package.json', label: '@wajek/wui' }];

const RELEASES = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'];
const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/;
const VERSION_RE = /^(\s*"version"\s*:\s*")([^"]+)(")/m;

const tty = process.stdout.isTTY;
const paint = (code) => (text) => (tty ? `\u001b[${code}m${text}\u001b[0m` : text);
const bold = paint('1');
const dim = paint('2');
const red = paint('31');
const green = paint('32');
const yellow = paint('33');
const cyan = paint('36');

/* ── Semver ─────────────────────────────────────────────────────────────── */

/** @returns {{major:number, minor:number, patch:number, prerelease:string}|null} */
function parseSemver(input) {
  const found = SEMVER_RE.exec(String(input).trim());

  if (!found) {
    return null;
  }

  return {
    major: Number(found[1]),
    minor: Number(found[2]),
    patch: Number(found[3]),
    prerelease: found[4] ?? '',
  };
}

function formatSemver(v) {
  const base = `${v.major}.${v.minor}.${v.patch}`;

  return v.prerelease ? `${base}-${v.prerelease}` : base;
}

/** Naikkan nomor di ujung prerelease, mis. `beta.2` -> `beta.3`, `3` -> `4`. */
function nextPrerelease(current, preid) {
  const parts = current ? current.split('.') : [];

  if (preid) {
    if (parts[0] === preid) {
      const last = parts.length > 1 ? Number.parseInt(parts[1], 10) : Number.NaN;

      return `${preid}.${Number.isNaN(last) ? 0 : last + 1}`;
    }

    return `${preid}.0`;
  }

  if (parts.length === 0) {
    return '0';
  }

  const last = Number.parseInt(parts[parts.length - 1], 10);

  if (Number.isNaN(last)) {
    return [...parts, '0'].join('.');
  }

  parts[parts.length - 1] = String(last + 1);

  return parts.join('.');
}

/**
 * Hitung versi berikutnya.
 * @param {string} current versi sekarang, mis. `20.0.0`
 * @param {string} release `major|minor|patch|premajor|preminor|prepatch|prerelease` atau versi eksplisit
 * @param {string|null} preid identifier prerelease, mis. `beta` (opsional)
 * @returns {{from:string, to:string}}
 */
function resolveVersion(current, release, preid = null) {
  const from = normalizeVersion(current, 'versi di manifest');
  const parsed = parseSemver(from);
  const next = { ...parsed };

  if (!RELEASES.includes(release)) {
    const explicit = parseSemver(release);

    if (!explicit) {
      throw new Error(
        `Nilai "${release}" bukan rilis semver yang dikenal.\n` +
          `Pakai salah satu: ${RELEASES.join(', ')} — atau versi lengkap, mis. 21.0.0.`,
      );
    }

    if (formatSemver(explicit) === from) {
      throw new Error(`Versi sudah ${from}, tidak ada yang berubah.`);
    }

    return { from, to: formatSemver(explicit) };
  }

  switch (release) {
    case 'major':
      // 1.0.0-beta.2 -> 1.0.0 (prerelease dari mayor yang sama cukup "dilepas").
      if (parsed.minor !== 0 || parsed.patch !== 0 || !parsed.prerelease) {
        next.major += 1;
      }

      next.minor = 0;
      next.patch = 0;
      next.prerelease = '';
      break;

    case 'minor':
      if (parsed.patch !== 0 || !parsed.prerelease) {
        next.minor += 1;
      }

      next.patch = 0;
      next.prerelease = '';
      break;

    case 'patch':
      // 1.2.3-beta.4 -> 1.2.3 (buang prerelease tanpa menaikkan patch).
      if (!parsed.prerelease) {
        next.patch += 1;
      }

      next.prerelease = '';
      break;

    case 'premajor':
      next.major += 1;
      next.minor = 0;
      next.patch = 0;
      next.prerelease = nextPrerelease('', preid);
      break;

    case 'preminor':
      next.minor += 1;
      next.patch = 0;
      next.prerelease = nextPrerelease('', preid);
      break;

    case 'prepatch':
      next.patch += 1;
      next.prerelease = nextPrerelease('', preid);
      break;

    case 'prerelease':
      if (parsed.prerelease) {
        next.prerelease = nextPrerelease(parsed.prerelease, preid);
      } else {
        next.patch += 1;
        next.prerelease = nextPrerelease('', preid);
      }

      break;
  }

  const to = formatSemver(next);

  if (to === from) {
    throw new Error(`Versi sudah ${from}, tidak ada yang berubah.`);
  }

  return { from, to };
}

function normalizeVersion(raw, source) {
  const trimmed = String(raw).trim();

  if (!parseSemver(trimmed)) {
    throw new Error(`Versi "${trimmed}" (${source}) bukan semver yang valid.`);
  }

  return trimmed;
}

/* ── Manifest ───────────────────────────────────────────────────────────── */

function manifestPath(manifest) {
  return join(ROOT, manifest.file);
}

function readManifest(manifest) {
  const text = readFileSync(manifestPath(manifest), 'utf8');
  const version = JSON.parse(text).version;

  if (!version) {
    throw new Error(`${manifest.file} tidak punya field "version".`);
  }

  return { text, version };
}

/**
 * Ganti hanya baris `"version"` — sisa isi file tidak tersentuh.
 * @returns {string} teks baru
 */
function withVersion(text, nextVersion, file) {
  const match = VERSION_RE.exec(text);

  if (!match) {
    throw new Error(`Field "version" tidak ditemukan di ${file}.`);
  }

  return text.replace(VERSION_RE, `$1${nextVersion}$3`);
}

/** Samakan rentang peerDependencies `@angular/*` dengan mayor baru (opt-in). */
function syncAngularPeers(text, major, file) {
  const json = JSON.parse(text);
  const peers = json.peerDependencies ?? {};
  const changed = [];

  for (const name of Object.keys(peers)) {
    if (!name.startsWith('@angular/')) {
      continue;
    }

    const wanted = `^${major}.0.0`;

    if (peers[name] !== wanted) {
      changed.push(`${name}: ${peers[name]} -> ${wanted}`);
      peers[name] = wanted;
    }
  }

  if (changed.length === 0) {
    return { text, changed };
  }

  // Tulis ulang hanya blok peerDependencies supaya format file tetap.
  const blockRe = /("peerDependencies"\s*:\s*\{)([\s\S]*?)(\n\s*\})/;
  const rebuilt = Object.entries(peers)
    .map(([name, range]) => `    "${name}": "${range}"`)
    .join(',\n');
  const updated = text.replace(blockRe, `$1\n${rebuilt}$3`);

  if (updated === text) {
    throw new Error(`Gagal memperbarui peerDependencies di ${file}.`);
  }

  return { text: updated, changed };
}

/* ── Argumen ────────────────────────────────────────────────────────────── */

const FLAGS = {
  '--dry-run': 'dryRun',
  '-n': 'dryRun',
  '--commit': 'commit',
  '-c': 'commit',
  '--tag': 'tag',
  '-t': 'tag',
  '--push': 'push',
  '--build': 'build',
  '--sync-peers': 'syncPeers',
  '--allow-dirty': 'allowDirty',
  '--no-verify': 'noVerify',
  '--help': 'help',
  '-h': 'help',
};

const OPTIONS = {
  '--preid': 'preid',
  '--tag-name': 'tagName',
  '--message': 'message',
  '-m': 'message',
};

function parseArgs(argv) {
  const opts = {
    release: null,
    preid: null,
    tagName: null,
    message: null,
    dryRun: false,
    commit: false,
    tag: false,
    push: false,
    build: false,
    syncPeers: false,
    allowDirty: false,
    noVerify: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg.startsWith('--') && arg.includes('=')) {
      const [key, ...rest] = arg.split('=');
      const value = rest.join('=');

      if (OPTIONS[key]) {
        opts[OPTIONS[key]] = value;
        continue;
      }

      if (FLAGS[key]) {
        // `--tag=v1.2.3` = buat tag dengan nama eksplisit.
        opts[FLAGS[key]] = true;
        opts.tagName = value;
        continue;
      }

      throw new Error(`Opsi tidak dikenal: ${key}`);
    }

    if (FLAGS[arg]) {
      opts[FLAGS[arg]] = true;
      continue;
    }

    if (OPTIONS[arg]) {
      const value = argv[i + 1];

      if (value === undefined) {
        throw new Error(`Opsi ${arg} butuh nilai.`);
      }

      opts[OPTIONS[arg]] = value;
      i += 1;
      continue;
    }

    if (arg.startsWith('-') && arg !== '-') {
      throw new Error(`Opsi tidak dikenal: ${arg}`);
    }

    if (opts.release) {
      throw new Error(`Argumen "${arg}" berlebih (rilis sudah diisi: ${opts.release}).`);
    }

    opts.release = arg;
  }

  return opts;
}

function printHelp() {
  console.log(`
${bold('bump-version — naikkan versi ' + MANIFESTS.map((m) => m.label).join(', '))}

${bold('Pakai')}
  node scripts/bump-version.mjs <rilis|versi> [opsi]

${bold('Rilis')}
  major  minor  patch                  rilis stabil
  premajor  preminor  prepatch         rilis uji (butuh/opsional --preid)
  prerelease                           naikkan nomor rilis uji yang sedang berjalan
  <versi>                              set eksplisit, mis. 21.0.0-beta.1

${bold('Opsi')}
  -n, --dry-run        tampilkan rencana saja, jangan tulis file
  -c, --commit         git commit perubahan manifest
      --tag[=NAMA]     buat git tag (default: nama = versi baru, mis. ${cyan('20.0.1')})
      --push           git push branch + tag (anggap --tag bila tag dibuat)
      --build          jalankan \`npm run build:wui\` setelah versi dinaikkan
      --sync-peers     samakan peerDependencies @angular/* ke ^<mayor baru>
      --allow-dirty    izinkan --commit walau worktree sudah kotor
      --no-verify      teruskan --no-verify ke git commit
      --preid <id>     identifier prerelease, mis. ${cyan('beta')} / ${cyan('rc')}
  -m, --message <m>    pesan commit (default: "release: v<versi>")
  -h, --help           tampilkan bantuan ini
`);
}

/* ── Git ────────────────────────────────────────────────────────────────── */

function git(args, { capture = false } = {}) {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
}

function isGitRepo() {
  try {
    return git(['rev-parse', '--is-inside-work-tree'], { capture: true }).trim() === 'true';
  } catch {
    return false;
  }
}

function assertCleanTree() {
  const dirty = git(['status', '--porcelain'], { capture: true }).trim();

  if (dirty) {
    throw new Error(
      'Worktree kotor — commit/stash dulu, atau jalankan dengan --allow-dirty:\n' +
        dirty
          .split('\n')
          .map((line) => `  ${line}`)
          .join('\n'),
    );
  }
}

/* ── Alur utama ─────────────────────────────────────────────────────────── */

function main() {
  let opts;

  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(red(`✗ ${error.message}`));
    process.exitCode = 1;

    return;
  }

  if (opts.help) {
    printHelp();

    return;
  }

  if (!opts.release) {
    console.error(red('✗ Sebutkan rilis yang diinginkan. Contoh: node scripts/bump-version.mjs patch'));
    console.error(dim('  Bantuan: --help'));
    process.exitCode = 1;

    return;
  }

  try {
    run(opts);
  } catch (error) {
    console.error(red(`✗ ${error.message}`));
    process.exitCode = 1;
  }
}

function run(opts) {
  const primary = MANIFESTS[0];
  const { text: primaryText, version: current } = readManifest(primary);
  const { from, to } = resolveVersion(current, opts.release, opts.preid);
  const tagName = opts.tagName ?? to;
  const useGit = opts.commit || opts.tag || opts.push;

  console.log(`${bold('bump-version')} ${dim(`(${primary.label})`)}`);
  console.log(`  versi   ${cyan(from)} → ${green(to)}`);
  console.log(`  rilis   ${opts.release}`);
  if (opts.commit) {
    console.log(`  commit  ${dim(opts.message ?? `release: v${to}`)}`);
  }
  if (opts.tag || opts.push) {
    console.log(`  tag     ${cyan(tagName)}`);
  }
  if (opts.dryRun) {
    console.log(yellow('  mode    dry-run (tidak ada file yang ditulis)'));
  }
  console.log('');

  if (useGit) {
    if (!isGitRepo()) {
      throw new Error('Opsi git diminta, tapi folder ini bukan git repository.');
    }

    if (opts.commit && !opts.allowDirty) {
      assertCleanTree();
    }

    if ((opts.tag || opts.push) && !opts.commit) {
      console.warn(
        yellow('  ! --tag/--push tanpa --commit: tag akan menunjuk commit lama (perubahan versi belum masuk).'),
      );
    }
  }

  const written = [];

  for (const manifest of MANIFESTS) {
    const { text } = manifest === primary ? { text: primaryText } : readManifest(manifest);
    let updated = withVersion(text, to, manifest.file);
    let peerNotes = [];

    if (opts.syncPeers) {
      const synced = syncAngularPeers(updated, parseSemver(to).major, manifest.file);
      updated = synced.text;
      peerNotes = synced.changed;
    }

    if (updated === text) {
      console.log(dim(`  ${manifest.file} sudah ${to}`));
      continue;
    }

    if (!opts.dryRun) {
      writeFileSync(manifestPath(manifest), updated, 'utf8');
    }

    written.push(manifest.file);
    console.log(`${green('✓')} ${manifest.file} ${dim('versi diperbarui')}`);

    for (const note of peerNotes) {
      console.log(`  ${dim('peer')} ${note}`);
    }
  }

  if (written.length === 0 && !opts.syncPeers) {
    console.log(dim('  Tidak ada yang berubah.'));

    return;
  }

  if (opts.dryRun) {
    console.log('');
    console.log(dim('  Jalankan tanpa --dry-run untuk menerapkan.'));

    return;
  }

  if (opts.build) {
    console.log('');
    console.log(dim('  Menjalankan build library…'));
    runChecked('npm', ['run', 'build:wui']);
    console.log(`${green('✓')} build selesai`);
  }

  if (opts.commit) {
    git(['add', ...MANIFESTS.map((m) => m.file)]);
    const args = ['commit', '-m', opts.message ?? `release: v${to}`];

    if (opts.noVerify) {
      args.push('--no-verify');
    }

    git(args);
    console.log(`${green('✓')} commit dibuat`);
  } else if (useGit && !opts.tag && !opts.push) {
    console.log(dim('  (manifest diubah, belum ada commit)'));
  }

  if (opts.tag || opts.push) {
    if (!isGitRepo()) {
      throw new Error('Opsi --tag/--push butuh git repository.');
    }

    git(['tag', '-a', tagName, '-m', tagName]);
    console.log(`${green('✓')} tag ${cyan(tagName)} dibuat`);
  }

  if (opts.push) {
    git(['push']);
    git(['push', 'origin', tagName]);
    console.log(`${green('✓')} branch & tag dikirim ke origin`);
  }

  console.log('');
  console.log(dim('  Langkah berikutnya (publish):'));
  console.log(dim('    npm run build:wui && cd dist/@wajek/wui && npm publish'));
}

function runChecked(command, args) {
  execFileSync(command, args, { cwd: ROOT, stdio: 'inherit' });
}

main();
