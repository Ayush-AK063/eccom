"""
Login / Register panel ke liye 24 transparent product combinations.
Sirf bina-brand-logo wale dummyjson products (Rolex/IWC/Prada/Calvin Klein/Nike/Puma skip).

Run: python3 -I scripts/generateAuthImages.py ../my-project/public/auth
"""
import io
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "auth")
OUT.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (auth-image-generator)"}


def get(url):
    req = urllib.request.Request(urllib.parse.quote(url, safe=":/?&="), headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def products(cat, keep):
    data = json.loads(get(f"https://dummyjson.com/products/category/{cat}?limit=0&select=images"))["products"]
    return [data[i]["images"] for i in keep if i < len(data)]


cache = {}


def cut(url, box):
    if url not in cache:
        im = Image.open(io.BytesIO(get(url))).convert("RGBA")
        cache[url] = im.crop(im.getchannel("A").getbbox())
    im = cache[url].copy()
    im.thumbnail(box, Image.LANCZOS)
    return im


bags = products("womens-bags", [0, 1, 3, 4])          # 2 = Prada skip
shades = products("sunglasses", [0, 1, 2, 4])          # 3 = party glasses skip
watches = products("womens-watches", [3, 4])           # 0-2 = IWC / Rolex skip
shoes = products("womens-shoes", [0, 2, 3, 4])         # 1 = Calvin Klein skip
jewel = products("womens-jewellery", [0, 1, 2])
dresses = products("womens-dresses", [0, 1, 2, 3])
tops = products("tops", [0, 1, 2, 3, 4])

# (hero, second, accessory) — hero bada left, second beech, accessory aage-right
combos = []
heroes = [bags[i % len(bags)] for i in range(4)] + [dresses[i] for i in range(4)] + [tops[i] for i in range(4)]
seconds = [shoes, bags, shoes, bags]
accs = [shades, watches, jewel, shades]
for n, hero in enumerate(heroes):
    sec_pool = seconds[n % 4]
    acc_pool = accs[(n + 1) % 4]
    combos.append((hero[0], sec_pool[n % len(sec_pool)][0], acc_pool[n % len(acc_pool)][0]))
    alt_acc = accs[(n + 2) % 4]
    alt_sec = seconds[(n + 1) % 4]
    combos.append((hero[min(1, len(hero) - 1)], alt_sec[(n + 1) % len(alt_sec)][0], alt_acc[(n + 1) % len(alt_acc)][0]))

W, H = 900, 560
for idx, (a, b, c) in enumerate(combos[:24], start=1):
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    items = [(cut(a, (380, 400)), 300, 290), (cut(b, (280, 280)), 575, 350), (cut(c, (220, 160)), 740, 470)]

    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(shadow)
    for im, cx, cy in items:
        x, y = cx - im.width // 2, cy - im.height // 2
        d.ellipse([x + im.width * 0.12, y + im.height * 0.9, x + im.width * 0.88, y + im.height * 1.02], fill=(60, 40, 20, 70))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(14)))

    for im, cx, cy in items:
        canvas.alpha_composite(im, (cx - im.width // 2, cy - im.height // 2))

    canvas = canvas.crop(canvas.getchannel("A").getbbox())
    path = OUT / f"combo-{idx:02d}.webp"
    canvas.save(path, "WEBP", quality=82)
    print("✔", path)
