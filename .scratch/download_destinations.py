import urllib.request
import urllib.parse
import json
import time
from pathlib import Path
from PIL import Image
from io import BytesIO

out_dir = Path("frontend/public/destinations")
out_dir.mkdir(parents=True, exist_ok=True)
headers = {
    "User-Agent": "MotoRentPurwokertoResearch/1.0 (https://github.com/marzhendo/MotoRent-Cloud)"
}

queries = {
    "baturraden.jpg": "Baturraden",
    "purwokerto-city.jpg": "Purwokerto Alun",
    "limpakuwus.jpg": "Gunung Slamet",
}

for fname, q in queries.items():
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
        {
            "action": "query",
            "generator": "search",
            "gsrnamespace": 6,
            "gsrsearch": q,
            "gsrlimit": 8,
            "prop": "imageinfo",
            "iiprop": "url|mime|size",
            "iiurlwidth": 960,
            "format": "json",
        }
    )
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read().decode())
    pages = data.get("query", {}).get("pages", {})
    saved = False
    for p in pages.values():
        ii = p.get("imageinfo", [{}])[0]
        if ii.get("mime") in ("image/jpeg", "image/png") and ii.get("width", 0) >= 600:
            thumb = ii.get("thumburl") or ii.get("url")
            title = p.get("title", "")
            print(f"{fname} <- {title}")
            try:
                req2 = urllib.request.Request(thumb, headers=headers)
                with urllib.request.urlopen(req2, timeout=20) as r2:
                    img = Image.open(BytesIO(r2.read())).convert("RGB")
                    tw, th = 800, 500
                    ratio = max(tw / img.width, th / img.height)
                    img = img.resize(
                        (int(img.width * ratio), int(img.height * ratio)), Image.LANCZOS
                    )
                    left = (img.width - tw) // 2
                    top = (img.height - th) // 2
                    img = img.crop((left, top, left + tw, top + th))
                    img.save(out_dir / fname, "JPEG", quality=88)
                    saved = True
                    break
            except Exception as exc:
                print(f"  Retry next candidate ({exc})")
    print(f"Saved {fname}: {saved}")
    time.sleep(1.5)
