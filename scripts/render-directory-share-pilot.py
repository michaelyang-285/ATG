"""Build the three preview cards with Pillow and the publication's fonts and business marks."""
from io import BytesIO
import json
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUTPUT = PUBLIC / "directory-share-cards"
INK = "#191916"
PAPER = "#FAF8F3"
ACCENT = "#FF4D22"


def font(size, weight="Medium"):
    return ImageFont.truetype(str(PUBLIC / "fonts" / f"DMSans-{weight}.ttf"), size)


def fit_lines(text, width, size, max_lines, weight="Bold"):
    for points in range(size, 19, -1):
        face = font(points, weight)
        lines = []
        line = ""
        for word in text.split():
            trial = f"{line} {word}".strip()
            if line and face.getlength(trial) > width:
                lines.append(line)
                line = word
            else:
                line = trial
        lines.append(line)
        if len(lines) <= max_lines and all(face.getlength(v) <= width for v in lines):
            return face, lines
    raise ValueError(f"Card text does not fit: {text}")


def draw_card(entry):
    card = Image.new("RGB", (1200, 630), PAPER)
    draw = ImageDraw.Draw(card)
    avatar = Image.open(PUBLIC / "brand" / "atg-avatar.png").convert("RGB").resize((63, 63), Image.Resampling.LANCZOS)
    card.paste(avatar, (56, 45))
    draw.text((137, 77), "All Things Gwinnett", fill=INK, font=font(29, "Bold"), anchor="lm")
    draw.text((1144, 77), "LOCAL DIRECTORY", fill=INK, font=font(22, "Bold"), anchor="rm")
    draw.line((56, 133, 1144, 133), fill=INK, width=2)

    # Give square marks and wide storefront lettering the same quiet, uncropped frame.
    left, top, right, bottom = 749, 167, 1144, 489
    draw.rectangle((left, top, right, bottom), fill="#EFEBE2")
    draw.rectangle((left+12, top+12, right-12, bottom-12), fill="white")
    if entry.get("logo"):
        request = Request(entry["logo"], headers={"User-Agent": "All Things Gwinnett directory preview"})
        with urlopen(request, timeout=20) as response:
            mark = ImageOps.exif_transpose(Image.open(BytesIO(response.read()))).convert("RGBA")
        mark.thumbnail((343, 270), Image.Resampling.LANCZOS)
        card.paste(mark, (int((left+right-mark.width)/2), int((top+bottom-mark.height)/2)), mark)
    else:
        face, _ = fit_lines(entry["name"][0], 280, 132, 1)
        draw.text(((left+right)//2, (top+bottom)//2), entry["name"][0], fill=INK, font=face, anchor="mm")

    name_face, lines = fit_lines(entry["name"], 660, 96, 2)
    sub_face, subs = fit_lines(entry["specialty"], 655, 38, 2, "Medium")
    line_height = round(name_face.size * 1.04)
    sub_height = round(sub_face.size * 1.14)
    block_height = line_height * len(lines) + 20 + sub_height * len(subs)
    y = (top + bottom - block_height)//2
    for line in lines:
        draw.text((52, y), line, font=name_face, fill=INK, anchor="lt")
        y += line_height
    y += 10
    for line in subs:
        draw.text((57, y), line, font=sub_face, fill="#484640", anchor="lt")
        y += sub_height

    draw.rectangle((0, 527, 1200, 630), fill=INK)
    draw.ellipse((57, 573, 70, 586), fill=ACCENT)
    draw.text((88, 579), entry["location"], fill="white", font=font(35, "Bold"), anchor="lm")
    if entry.get("place"):
        draw.text((1144, 579), entry["place"], fill="#EEEAE2", font=font(28), anchor="rm")
    return card


if __name__ == "__main__":
    OUTPUT.mkdir(exist_ok=True)
    for entry in json.loads((ROOT / "lib/directory/share-pilot.json").read_text()):
        image = draw_card(entry)
        image.save(OUTPUT / f"{entry['slug']}.jpg", quality=88, optimize=True, subsampling=0)
