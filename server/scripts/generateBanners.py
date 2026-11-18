"""
Home page ke promo banners generate karta hai (random stock photo ki jagah).
Asli product cutouts (dummyjson, white background) + saaf background + offer text.

Run:  python3 -I scripts/generateBanners.py <output_dir>
Phir: BANNER_DIR=<output_dir> node scripts/seedImages.js slides
"""
import io
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "banners")
OUT.mkdir(parents=True, exist_ok=True)

FONT = "/System/Library/Fonts/Avenir Next.ttc"
BOLD, DEMI, MEDIUM, REGULAR, HEAVY = 0, 2, 5, 7, 8
RED = (255, 82, 82)
INK = (17, 24, 39)
MUTED = (75, 85, 99)


def font(size, face=BOLD):
    return ImageFont.truetype(FONT, size, index=face)


SYMBOL_FONT = "/System/Library/Fonts/Kohinoor.ttc"


def text_mixed(d, xy, text, f, fill):
    """₹ jaise symbols Avenir mein nahi hain -> sirf unke liye Arial Unicode."""
    x, y = xy
    sym = ImageFont.truetype(SYMBOL_FONT, int(f.size * 0.92))
    for ch in text:
        use = sym if ch in "₹" else f
        d.text((x, y + (f.size * 0.06 if use is sym else 0)), ch, font=use, fill=fill)
        x += d.textlength(ch, font=use)


UA = {"User-Agent": "Mozilla/5.0 (banner-generator)"}


def fetch_json(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return json.load(r)


def fetch_img(url):
    safe = urllib.parse.quote(url, safe=":/")
    with urllib.request.urlopen(urllib.request.Request(safe, headers=UA), timeout=30) as r:
        return Image.open(io.BytesIO(r.read())).convert("RGBA")


def products(cat):
    return fetch_json(f"https://dummyjson.com/products/category/{cat}?limit=0&select=title,images")["products"]


def vertical_gradient(w, h, top, bottom):
    g = Image.new("RGB", (w, h), top)
    d = ImageDraw.Draw(g)
    for y in range(h):
        t = y / max(1, h - 1)
        d.line([(0, y), (w, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return g


def place(canvas, img, box_w, box_h, cx, cy, shadow=True):
    """Transparent product cutout ko canvas pe lagao, neeche halki shadow."""
    im = img.copy()
    bbox = im.getchannel("A").getbbox()
    if bbox:
        im = im.crop(bbox)  # khaali transparent kinare hatao
    im.thumbnail((box_w, box_h), Image.LANCZOS)
    x, y = int(cx - im.width / 2), int(cy - im.height / 2)
    if shadow:
        sh = Image.new("L", canvas.size, 0)
        ImageDraw.Draw(sh).ellipse(
            [x + im.width * 0.18, y + im.height * 0.9, x + im.width * 0.82, y + im.height * 1.0], fill=70
        )
        sh = sh.filter(ImageFilter.GaussianBlur(18))
        dark = Image.new("RGB", canvas.size, (0, 0, 0))
        canvas.paste(Image.composite(dark, canvas, sh.point(lambda v: int(v * 0.5))), (0, 0))
    canvas.paste(im, (x, y), im)


def circle(canvas, cx, cy, r, color):
    d = ImageDraw.Draw(canvas)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)


def pill(d, x, y, text, f, bg, fg, pad_x=26, pad_y=12):
    tw = d.textlength(text, font=f)
    asc, desc = f.getmetrics()
    h = asc + desc + pad_y * 2
    d.rounded_rectangle([x, y, x + tw + pad_x * 2, y + h], radius=6, fill=bg)
    d.text((x + pad_x, y + pad_y), text, font=f, fill=fg)
    return h


def save(img, name):
    p = OUT / f"{name}.jpg"
    img.save(p, "JPEG", quality=88, optimize=True)
    print("✔", p)


# ── Product sources ──
bags = products("womens-bags")
watches = products("womens-watches")
shades = products("sunglasses")
shoes = products("womens-shoes")
jewel = products("womens-jewellery")

img = lambda lst, i, k=0: fetch_img(lst[i % len(lst)]["images"][k])

# ── Left Big Banners (1600x900): product left, right half khaali (site wahan text likhti hai) ──
for n, (bg, accent, prod) in enumerate([
    (((236, 223, 208), (214, 196, 176)), (226, 208, 188), img(bags, 1)),   # warm beige + brown bag
    (((205, 219, 214), (176, 196, 189)), (190, 208, 201), img(bags, 2)),   # sage + blue bag
]):
    c = vertical_gradient(1600, 900, *bg)
    circle(c, 520, 470, 330, accent)
    place(c, prod, 600, 600, 520, 450)
    save(c, f"left-big-{n + 1}")

# ── Right Top / Right Down (900x640): text side opposite product ──
c = vertical_gradient(900, 640, (240, 230, 236), (222, 205, 214))
circle(c, 640, 330, 220, (231, 214, 224))
place(c, img(watches, 0), 380, 380, 640, 320)
save(c, "right-top")          # text left

c = vertical_gradient(900, 640, (228, 233, 242), (204, 213, 228))
circle(c, 260, 330, 220, (215, 223, 236))
place(c, img(shades, 0), 400, 300, 260, 320)
save(c, "right-down")         # text right

# ── v2 Banners (1200x900, 4:3) — text image ke andar ──
v2 = [
    ("NEW ARRIVALS", "Handbags", "Starting ₹999", (253, 241, 236), (249, 226, 216), img(bags, 3)),
    ("TRENDING", "Sunglasses", "Up to 40% off", (238, 244, 250), (220, 232, 245), img(shades, 2)),
    ("BESTSELLERS", "Footwear", "Flat 30% off", (243, 240, 250), (228, 222, 245), img(shoes, 1)),
]
for n, (tag, title, offer, top, bottom, prod) in enumerate(v2):
    c = vertical_gradient(1200, 900, top, bottom)
    circle(c, 900, 450, 250, tuple(max(0, v - 8) for v in bottom))
    place(c, prod, 400, 400, 900, 440)
    d = ImageDraw.Draw(c)
    d.text((80, 250), tag, font=font(34, DEMI), fill=RED)
    d.text((76, 300), title, font=font(88, BOLD), fill=INK)
    text_mixed(d, (80, 420), offer, font(46, MEDIUM), MUTED)
    pill(d, 80, 520, "Shop now", font(34, DEMI), INK, (255, 255, 255))
    save(c, f"v2-{n + 1}")

# ── v3 Banner (2400x600, 4:1) — wide sale strip ──
c = vertical_gradient(2400, 600, (255, 236, 234), (255, 222, 218))
d = ImageDraw.Draw(c)
d.text((140, 130), "SEASON SALE", font=font(40, DEMI), fill=RED)
d.text((134, 185), "Up to 50% off", font=font(120, HEAVY), fill=INK)
d.text((140, 345), "On bags, watches, sunglasses & more", font=font(44, MEDIUM), fill=MUTED)
pill(d, 140, 430, "Shop the sale", font(36, DEMI), RED, (255, 255, 255))
for cx, src in zip([1450, 1800, 2150], [img(bags, 0), img(watches, 0), img(jewel, 0)]):
    circle(c, cx, 300, 190, (255, 212, 207))
    place(c, src, 300, 300, cx, 290)
save(c, "v3-1")

# ── Blog covers (1600x1000, 16:10) — text nahi, card khud title dikhata hai ──
for n, (top, bottom, items) in enumerate([
    ((246, 236, 226), (233, 216, 200), [img(bags, 1), img(bags, 4)]),      # handbag guide
    ((234, 240, 246), (214, 225, 238), [img(shades, 0), img(shades, 2)]),  # sunglasses
    ((244, 238, 246), (228, 218, 236), [img(watches, 0), img(jewel, 1)]),  # accessories
    ((240, 244, 238), (220, 230, 216), [img(shoes, 2), img(bags, 3)]),     # travel essentials
]):
    c = vertical_gradient(1600, 1000, top, bottom)
    circle(c, 800, 500, 360, tuple(max(0, v - 7) for v in bottom))
    place(c, items[0], 520, 520, 650, 500)
    place(c, items[1], 400, 400, 1010, 560)
    save(c, f"blog-{n + 1}")

# ── Shop by Collection covers — text nahi (site upar likhti hai), product upar-right, neeche-left text ke liye khaali ──
for name, (w, h), (top, bottom), items in [
    ("collection-everyday", (1200, 1200), ((238, 226, 214), (214, 194, 174)), [img(bags, 4), img(bags, 0)]),
    ("collection-shades", (1200, 800), ((226, 236, 246), (196, 214, 234)), [img(shades, 1), img(shades, 2)]),
    ("collection-jewellery", (1200, 800), ((246, 232, 238), (230, 206, 218)), [img(jewel, 0), img(jewel, 2)]),
    ("collection-footwear", (1200, 800), ((238, 242, 232), (214, 224, 204)), [img(shoes, 2), img(shoes, 3)]),
    ("collection-watches", (1200, 800), ((240, 236, 248), (220, 212, 238)), [img(watches, 0), img(watches, 3)]),
]:
    c = vertical_gradient(w, h, top, bottom)
    s = min(w, h)
    circle(c, int(w * 0.66), int(h * 0.42), int(s * 0.34), tuple(max(0, v - 8) for v in bottom))
    place(c, items[0], int(s * 0.42), int(s * 0.42), int(w * 0.58), int(h * 0.40))
    place(c, items[1], int(s * 0.32), int(s * 0.32), int(w * 0.80), int(h * 0.50))
    save(c, name)
