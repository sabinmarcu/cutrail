#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const mode = process.argv.includes('--check') ? 'check' : 'write';

const packageJsonPath = resolve(root, 'package.json');
const files = {
  cutrailPkgbuild: resolve(root, 'packaging/aur/cutrail/PKGBUILD'),
  cutrailSrcinfo: resolve(root, 'packaging/aur/cutrail/.SRCINFO'),
  cutrailGitPkgbuild: resolve(root, 'packaging/aur/cutrail-git/PKGBUILD'),
  cutrailGitSrcinfo: resolve(root, 'packaging/aur/cutrail-git/.SRCINFO'),
};

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

const electronRaw = packageJson.devDependencies?.electron;
if (!electronRaw) {
  throw new Error('Unable to find devDependencies.electron in package.json');
}

const electronMajor = Number(electronRaw.replace(/^[^0-9]+/, '').split('.')[0]);

let changed = false;

const sharedElectronDepends = `'electron${electronMajor}' 'glibc' 'gtk3' 'nss' 'libxss' 'libxtst' 'xdg-utils' 'at-spi2-core' 'libdrm' 'alsa-lib'`;
const protoMakeDepends = 'proto-bin';

const replacements = {
  cutrailPkgbuild: [
    {
      from: /depends=\([^\n]*\)/,
      to: `depends=(${sharedElectronDepends})`,
    },
    {
      from: /makedepends=\([^\n]*\)/,
      to: `makedepends=('${protoMakeDepends}')`,
    },
    {
      from:
        /	(?:proto install\n)?(?:\tlocal proto_node_bin\n\tproto_node_bin="\$\(proto bin node\)"\n\texport PATH="\$\(dirname "\$\{proto_node_bin\}"\):\$\{PATH\}"\n)?\t(?:corepack )?yarn install --immutable\n\t(?:corepack )?(?:yarn build|yarn electron-builder --linux AppImage --publish never -c\.electronDist=\/usr\/lib\/electron\d+ -c\.electronVersion=[^\n]+|proto run yarn -- build|proto run yarn -- electron-builder --linux AppImage --publish never -c\.electronDist=\/usr\/lib\/electron\d+ -c\.electronVersion=[^\n]+|proto exec node yarn -- yarn build)|\tproto install\n(?:\tlocal proto_node_bin\n\tproto_node_bin="\$\(proto bin node\)"\n\texport PATH="\$\(dirname "\$\{proto_node_bin\}"\):\$\{PATH\}"\n)?(?:\tproto run yarn -- install --immutable\n\tproto run yarn -- build|\tproto exec node yarn -- yarn install --immutable\n\tproto exec node yarn -- yarn build)/,
      to:
        '\tproto install\n' +
        '\tproto exec node yarn -- yarn install --immutable\n' +
        '\tproto exec node yarn -- yarn build',
    },
  ],
  cutrailSrcinfo: [
    {
      from: /\tdepends = .*\n(?:\tdepends = .*\n)*/,
      to:
        `\tdepends = electron${electronMajor}\n` +
        '\tdepends = glibc\n' +
        '\tdepends = gtk3\n' +
        '\tdepends = nss\n' +
        '\tdepends = libxss\n' +
        '\tdepends = libxtst\n' +
        '\tdepends = xdg-utils\n' +
        '\tdepends = at-spi2-core\n' +
        '\tdepends = libdrm\n' +
        '\tdepends = alsa-lib\n',
    },
    {
      from: /\tmakedepends = .*\n(?:\tmakedepends = .*\n)*/,
      to: `\tmakedepends = ${protoMakeDepends}\n`,
    },
  ],
  cutrailGitPkgbuild: [
    {
      from: /depends=\([^\n]*\)/,
      to: `depends=(${sharedElectronDepends})`,
    },
    {
      from: /makedepends=\([^\n]*\)/,
      to: `makedepends=('git' '${protoMakeDepends}')`,
    },
    {
      from: /source=\('cutrail::git\+https:\/\/github\.com\/sabinmarcu\/cutrail\.git#branch=[^']+'\)/,
      to: "source=('cutrail::git+https://github.com/sabinmarcu/cutrail.git#branch=master')",
    },
    {
      from:
        /	(?:proto install\n)?(?:\tlocal proto_node_bin\n\tproto_node_bin="\$\(proto bin node\)"\n\texport PATH="\$\(dirname "\$\{proto_node_bin\}"\):\$\{PATH\}"\n)?\t(?:corepack )?yarn install --immutable\n\t(?:corepack )?(?:yarn build|yarn electron-builder --linux AppImage --publish never -c\.electronDist=\/usr\/lib\/electron\d+ -c\.electronVersion=[^\n]+|proto run yarn -- build|proto run yarn -- electron-builder --linux AppImage --publish never -c\.electronDist=\/usr\/lib\/electron\d+ -c\.electronVersion=[^\n]+|proto exec node yarn -- yarn build)|\tproto install\n(?:\tlocal proto_node_bin\n\tproto_node_bin="\$\(proto bin node\)"\n\texport PATH="\$\(dirname "\$\{proto_node_bin\}"\):\$\{PATH\}"\n)?(?:\tproto run yarn -- install --immutable\n\tproto run yarn -- build|\tproto exec node yarn -- yarn install --immutable\n\tproto exec node yarn -- yarn build)/,
      to:
        '\tproto install\n' +
        '\tproto exec node yarn -- yarn install --immutable\n' +
        '\tproto exec node yarn -- yarn build',
    },
  ],
  cutrailGitSrcinfo: [
    {
      from: /\tdepends = .*\n(?:\tdepends = .*\n)*/,
      to:
        `\tdepends = electron${electronMajor}\n` +
        '\tdepends = glibc\n' +
        '\tdepends = gtk3\n' +
        '\tdepends = nss\n' +
        '\tdepends = libxss\n' +
        '\tdepends = libxtst\n' +
        '\tdepends = xdg-utils\n' +
        '\tdepends = at-spi2-core\n' +
        '\tdepends = libdrm\n' +
        '\tdepends = alsa-lib\n',
    },
    {
      from: /\tmakedepends = .*\n(?:\tmakedepends = .*\n)*/,
      to: `\tmakedepends = git\n\tmakedepends = ${protoMakeDepends}\n`,
    },
    {
      from: /\tsource = cutrail::git\+https:\/\/github\.com\/sabinmarcu\/cutrail\.git#branch=.*/,
      to: '\tsource = cutrail::git+https://github.com/sabinmarcu/cutrail.git#branch=master',
    },
  ],
};

for (const [key, filePath] of Object.entries(files)) {
  let content = readFileSync(filePath, 'utf8');
  const original = content;

  for (const rule of replacements[key]) {
    content = content.replace(rule.from, rule.to);
  }

  if (content !== original) {
    changed = true;
    if (mode === 'write') {
      writeFileSync(filePath, content, 'utf8');
      console.log(`updated ${filePath}`);
    } else {
      console.error(`out-of-sync ${filePath}`);
    }
  }
}

if (mode === 'check' && changed) {
  process.exit(1);
}

console.log(changed ? 'aur toolchain metadata synchronized' : 'aur toolchain metadata already synchronized');