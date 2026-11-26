"""Render the directory pilot with reusable category artwork and the ATG brand assets."""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ART = ROOT / "scripts" / "directory-share-art"
OUT = PUBLIC / "directory-share-cards"
COLORS = {
    "bakery": ("#352022", "#FFD0A2"),
    "fitness-testing": ("#123039", "#ACE9DC"),
    "marketing": ("#24223A", "#E4CCFF"),
}


def font(size, weight="Medium"):
    return ImageFont.truetype(str(PUBLIC / "fonts" / f"DMSans-{weight}.ttf"), size)


def fitted(text, start, width, weight):
    for size in range(start, 22, -1):
        face = font(size, weight)
        if face.getlength(text) <= width:
            return face
    raise ValueError(f"Card line needs shorter copy: {text}")


def draw_card(entry, avatar):
    category = entry["artCategory"]
    background, accent = COLORS[category]
    card = Image.new("RGB", (1200, 630), background)
    with Image.open(ART / f"{category}.webp") as art:
        if art.size != (1200, 400):
            raise ValueError(f"Unexpected dimensions for {category}")
        card.paste(art, (0, 0))

    draw = ImageDraw.Draw(card)
    draw.rectangle((0, 400, 1199, 403), fill=accent)
    eyebrow = f'{entry["categoryLabel"].upper()}   /   {entry["location"].upper()}'
    draw.text((48, 431), eyebrow, font=font(25, "Bold"), fill=accent, anchor="lt")
    draw.text((44, 470), entry["name"], font=fitted(entry["name"], 80, 865, "Bold"),
              fill="#FFFCF4", anchor="lt")
    draw.text((48, 564), entry["specialty"], font=fitted(entry["specialty"], 35, 860, "Medium"),
              fill="#FFFCF4", anchor="lt")

    # Use the original mark and publication font at their actual proportions.
    card.paste(avatar, (1034, 441))
    draw.text((1077, 552), "All Things Gwinnett", font=font(23, "Bold"),
              fill="#FFFCF4", anchor="mt")
    return card


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True, parents=True)
    entries = json.loads((ROOT / "lib/directory/share-pilot.json").read_text())
    with Image.open(PUBLIC / "brand" / "atg-avatar.png") as logo:
        avatar = logo.convert("RGB").resize((86, 86), Image.Resampling.LANCZOS)
    for entry in entries:
        draw_card(entry, avatar).save(OUT / f'{entry["slug"]}.jpg',
                                      quality=91, optimize=True, subsampling=0)
