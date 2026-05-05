#!/usr/bin/env python3
"""
Actualiza los parámetros de versión en index.html para cache busting
"""
import re
import sys
from pathlib import Path
from datetime import datetime

def update_version(project_name=None):
    version = int(datetime.now().timestamp() * 1000)
    script_dir = Path(__file__).parent.parent.parent
    if not project_name:
        project_name = script_dir.name
    html_path = script_dir / 'index.html'
    if not html_path.exists():
        print(f"❌ Error: {html_path} no encontrado")
        return
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()
    html = re.sub(r'\?v=\d+', '', html)
    html = re.sub(
        r'(<link[^>]*href=["\'])(assets/styles/styles\.css)(["\'][^>]*>)',
        rf'\1\2?v={version}\3',
        html
    )
    html = re.sub(
        r"(const nrdDataAccessSrc = isLocalhost\s*\?\s*['\"])(/nrd-data-access/dist/nrd-data-access\.js)(['\"])",
        rf'\1\2?v={version}\3',
        html
    )
    html = re.sub(
        r"(const nrdCommonSrc = isLocalhost\s*\?\s*['\"])(/nrd-common/dist/nrd-common\.js)(['\"])",
        rf'\1\2?v={version}\3',
        html
    )
    html = re.sub(
        r'(<script[^>]*src=["\'])(app\.js)(["\'][^>]*>)',
        rf'\1\2?v={version}\3',
        html
    )
    html = re.sub(
        r"(navigator\.serviceWorker\.register\(['\"])(service-worker\.js)(['\"])",
        rf'\1\2?v={version}\3',
        html
    )
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    import json
    version_path = script_dir / 'version.json'
    with open(version_path, 'w', encoding='utf-8') as f:
        json.dump({'v': version}, f)
    print(f"✅ {project_name}: Version updated to: {version}")

if __name__ == "__main__":
    project_name = sys.argv[1] if len(sys.argv) > 1 else None
    update_version(project_name)
