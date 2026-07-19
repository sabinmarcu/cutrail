#!/usr/bin/env node

import {
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const resolve = path.resolve.bind(path);
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
const sharedElectronDepends = `'electron${electronMajor}' 'glibc' 'gtk3' 'nss' 'libxss' 'libxtst' 'xdg-utils' 'at-spi2-core' 'libdrm' 'alsa-lib'`;
const protoMakeDepends = 'proto-bin';

const packageBuildBlockPattern = /\t(?:proto install\n)?(?:\tlocal proto_node_bin\n\tproto_node_bin="\$\(proto bin node\)"\n\texport PATH="\$\(dirname "\$\{proto_node_bin\}"\):\$\{PATH\}"\n)?\t(?:corepack )?yarn install --immutable\n\t(?:corepack )?(?:yarn build|yarn electron-builder --linux AppImage --publish never -c\.electronDist=\/usr\/lib\/electron\d+ -c\.electronVersion=[^\n]+|proto run yarn -- build|proto run yarn -- electron-builder --linux AppImage --publish never -c\.electronDist=\/usr\/lib\/electron\d+ -c\.electronVersion=[^\n]+|proto exec node yarn -- yarn build)(?:\n\t(?:corepack )?yarn build:node|\n\tproto run yarn -- build:node|\n\tproto exec node yarn -- yarn build:node)?|\tproto install\n(?:\tlocal proto_node_bin\n\tproto_node_bin="\$\(proto bin node\)"\n\texport PATH="\$\(dirname "\$\{proto_node_bin\}"\):\$\{PATH\}"\n)?(?:\tproto run yarn -- install --immutable\n\tproto run yarn -- build(?:\n\tproto run yarn -- build:node)?|\tproto exec node yarn -- yarn install --immutable\n\tproto exec node yarn -- yarn build(?:\n\tproto exec node yarn -- yarn build:node)?)/;
const srcinfoDependsPattern = /\tdepends = .*\n(?:\tdepends = .*\n)*/;
const srcinfoMakedependsPattern = /\tmakedepends = .*\n(?:\tmakedepends = .*\n)*/;
const gitSourcePattern = /source=\('cutrail::git\+https:\/\/github\.com\/sabinmarcu\/cutrail\.git#branch=[^']+'\)/;
const gitSrcinfoSourcePattern = /\tsource = cutrail::git\+https:\/\/github\.com\/sabinmarcu\/cutrail\.git#branch=.*/;

const normalizedBuildBlock = [
  '\tproto install',
  '\tproto exec node yarn -- yarn install --immutable',
  '\tproto exec node yarn -- yarn build',
  '\tproto exec node yarn -- yarn build:node',
].join('\n');

const normalizedCutrailDependsSrcinfo = [
  `\tdepends = electron${electronMajor}`,
  '\tdepends = glibc',
  '\tdepends = gtk3',
  '\tdepends = nss',
  '\tdepends = libxss',
  '\tdepends = libxtst',
  '\tdepends = xdg-utils',
  '\tdepends = at-spi2-core',
  '\tdepends = libdrm',
  '\tdepends = alsa-lib',
  '',
].join('\n');

const normalizedCutrailGitMakedependsSrcinfo = [
  '\tmakedepends = git',
  `\tmakedepends = ${protoMakeDepends}`,
  '',
].join('\n');

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
      from: packageBuildBlockPattern,
      to: normalizedBuildBlock,
    },
  ],
  cutrailSrcinfo: [
    {
      from: srcinfoDependsPattern,
      to: normalizedCutrailDependsSrcinfo,
    },
    {
      from: srcinfoMakedependsPattern,
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
      from: gitSourcePattern,
      to: "source=('cutrail::git+https://github.com/sabinmarcu/cutrail.git#branch=master')",
    },
    {
      from: packageBuildBlockPattern,
      to: normalizedBuildBlock,
    },
  ],
  cutrailGitSrcinfo: [
    {
      from: srcinfoDependsPattern,
      to: normalizedCutrailDependsSrcinfo,
    },
    {
      from: srcinfoMakedependsPattern,
      to: normalizedCutrailGitMakedependsSrcinfo,
    },
    {
      from: gitSrcinfoSourcePattern,
      to: '\tsource = cutrail::git+https://github.com/sabinmarcu/cutrail.git#branch=master',
    },
  ],
};

let changed = false;

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
