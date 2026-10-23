#!/usr/bin/env python3
"""Build the Windows release from the checkout and the official, pinned Caddy ZIP."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE_SHA512 = 'c308154504e53755958ffc62d8a2657ab17eefd6dd25c45dbb2c3d93d29519971f77ca652f7d0f2bcb7f980b9ba3822478865e29969d0272d7613550a43152b1'


def build(archive, output, flat=False):
    if hashlib.sha512(archive.read_bytes()).hexdigest() != ARCHIVE_SHA512:
        raise ValueError('Official Caddy Windows archive failed SHA-512 verification.')
    version = json.loads((ROOT / 'package.json').read_text())['version']
    manifest = json.loads((ROOT / 'hosting/caddy-manifest.json').read_text())
    prefix = '' if flat else 'Miniopoly-v' + version + '/'
    with zipfile.ZipFile(archive) as tool:
        executable = tool.read('caddy.exe')
        if hashlib.sha512(executable).hexdigest() != manifest['files']['windows']['sha512']:
            raise ValueError('Caddy executable does not match the pinned manifest.')
        names = subprocess.check_output(['git', 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], cwd=ROOT).decode().split('\0')
        output.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as release:
            for name in sorted(set(names)):
                if not name or name.startswith(('.git/', '.env', 'node_modules/', 'saves/', 'attachments/', 'hosting/tools/')) or name.endswith('.zip'):
                    continue
                file = ROOT / name
                if not file.is_file() or file.is_symlink():
                    continue
                release.write(file, prefix + name)
            for name in ['caddy.exe', 'LICENSE', 'README.md']:
                release.writestr(prefix + 'hosting/tools/' + name, tool.read(name))
            release.writestr(prefix + 'hosting/tools/official-checksums.txt', (archive.parent / 'checksums.txt').read_bytes())

    with zipfile.ZipFile(output) as release:
        bad = release.testzip()
        if bad:
            raise ValueError('Release ZIP integrity error: ' + bad)
        print(str(output) + '\n' + str(output.stat().st_size) + ' bytes; ' + str(len(release.namelist())) + ' files')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('caddy_archive', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--flat', action='store_true', help='Put launchers at ZIP root for extraction into an existing installation.')
    args = parser.parse_args()
    build(args.caddy_archive.resolve(), args.output.resolve(), flat=args.flat)
