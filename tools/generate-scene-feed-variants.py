from __future__ import annotations

from pathlib import Path
from random import Random

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE = PROJECT_ROOT / "public" / "assets" / "environment" / "offshore-field-feed_v001.png"
OUTPUT_DIR = SOURCE.parent

SCENE_VARIANTS = {
    "SCN007": ("monopile", "clear", "offshore-field-feed_scn007_monopile_clear_v001.png"),
    "SCN008": ("monopile", "rain", "offshore-field-feed_scn008_monopile_rain_v001.png"),
    "SCN009": ("monopile", "dusk", "offshore-field-feed_scn009_monopile_dusk_v001.png"),
    "SCN010": ("monopile", "night", "offshore-field-feed_scn010_monopile_night_v001.png"),
    "SCN011": ("jacket_foundation", "dawn", "offshore-field-feed_scn011_jacket_dawn_v001.png"),
    "SCN012": ("jacket_foundation", "clear", "offshore-field-feed_scn012_jacket_clear_v001.png"),
    "SCN013": ("jacket_foundation", "rain", "offshore-field-feed_scn013_jacket_rain_v001.png"),
    "SCN014": ("jacket_foundation", "dusk", "offshore-field-feed_scn014_jacket_dusk_v001.png"),
    "SCN015": ("jacket_foundation", "night", "offshore-field-feed_scn015_jacket_night_v001.png"),
    "SCN016": ("floating_turbine", "dawn", "offshore-field-feed_scn016_floating_dawn_v001.png"),
    "SCN023": ("substation", "rain", "offshore-field-feed_scn023_substation_rain_v001.png"),
    "SCN024": ("substation", "dusk", "offshore-field-feed_scn024_substation_dusk_v001.png"),
    "SCN025": ("substation", "night", "offshore-field-feed_scn025_substation_night_v001.png"),
    "SCN026": ("port", "dawn", "offshore-field-feed_scn026_port_dawn_v001.png"),
    "SCN042": ("jackup", "clear", "offshore-field-feed_scn042_jackup_clear_v001.png"),
    "SCN043": ("jackup", "rain", "offshore-field-feed_scn043_jackup_rain_v001.png"),
    "SCN044": ("jackup", "dusk", "offshore-field-feed_scn044_jackup_dusk_v001.png"),
    "SCN045": ("jackup", "night", "offshore-field-feed_scn045_jackup_night_v001.png"),
    "SCN046": ("heavy_lift", "dawn", "offshore-field-feed_scn046_heavylift_dawn_v001.png"),
    "SCN082": ("lab", "clear", "offshore-field-feed_scn082_lab_clear_v001.png"),
    "SCN083": ("lab", "rain", "offshore-field-feed_scn083_lab_rain_v001.png"),
    "SCN084": ("lab", "dusk", "offshore-field-feed_scn084_lab_dusk_v001.png"),
    "SCN085": ("lab", "night", "offshore-field-feed_scn085_lab_night_v001.png"),
    "SCN086": ("switchgear", "dawn", "offshore-field-feed_scn086_switchgear_dawn_v001.png"),
}


def gradient_overlay(base: Image.Image, top: tuple[int, int, int], bottom: tuple[int, int, int], alpha_top: float, alpha_bottom: float) -> Image.Image:
    width, height = base.size
    overlay = Image.new("RGBA", base.size)
    pixels = overlay.load()
    for y in range(height):
        t = y / max(1, height - 1)
        color = tuple(int(top[index] * (1 - t) + bottom[index] * t) for index in range(3))
        alpha = int(255 * (alpha_top * (1 - t) + alpha_bottom * t))
        for x in range(width):
            pixels[x, y] = (*color, alpha)
    return Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")


def apply_mood(base: Image.Image, mood: str, seed: int) -> Image.Image:
    image = base.convert("RGB")
    if mood == "clear":
        image = ImageEnhance.Color(image).enhance(1.04)
        image = ImageEnhance.Contrast(image).enhance(1.04)
        image = ImageEnhance.Brightness(image).enhance(1.03)
        return image
    if mood == "dawn":
        image = ImageEnhance.Color(image).enhance(1.08)
        image = ImageEnhance.Contrast(image).enhance(1.04)
        image = ImageEnhance.Brightness(image).enhance(1.03)
        return gradient_overlay(image, (120, 145, 205), (255, 178, 96), 0.18, 0.10)
    if mood == "dusk":
        image = ImageEnhance.Color(image).enhance(1.12)
        image = ImageEnhance.Contrast(image).enhance(1.02)
        image = ImageEnhance.Brightness(image).enhance(0.88)
        return gradient_overlay(image, (72, 60, 126), (255, 139, 61), 0.28, 0.16)
    if mood == "night":
        image = ImageEnhance.Color(image).enhance(0.42)
        image = ImageEnhance.Contrast(image).enhance(1.08)
        image = ImageEnhance.Brightness(image).enhance(0.36)
        return gradient_overlay(image, (10, 30, 64), (3, 15, 35), 0.35, 0.26)
    if mood == "rain":
        image = ImageEnhance.Color(image).enhance(0.68)
        image = ImageEnhance.Contrast(image).enhance(0.92)
        image = ImageEnhance.Brightness(image).enhance(0.82)
        image = gradient_overlay(image, (38, 69, 91), (72, 91, 102), 0.18, 0.10)
        rain = Image.new("RGBA", image.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(rain)
        rng = Random(seed)
        width, height = image.size
        for _ in range(360):
            x = rng.randint(-80, width + 20)
            y = rng.randint(-20, height + 20)
            length = rng.randint(18, 42)
            drift = rng.randint(5, 13)
            alpha = rng.randint(38, 88)
            draw.line((x, y, x + drift, y + length), fill=(225, 235, 240, alpha), width=1)
        return Image.alpha_composite(image.convert("RGBA"), rain.filter(ImageFilter.GaussianBlur(radius=0.35))).convert("RGB")
    raise ValueError(f"Unknown mood: {mood}")


def draw_substation(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    deck_y = int(height * 0.55)
    draw.rectangle((int(width * 0.58), deck_y, int(width * 0.93), int(height * 0.75)), fill=(43, 55, 60, 170), outline=(196, 155, 74, 190), width=3)
    for index in range(6):
        x = int(width * (0.61 + index * 0.05))
        draw.line((x, deck_y, x, int(height * 0.74)), fill=(202, 162, 74, 150), width=2)
    draw.rectangle((int(width * 0.64), int(height * 0.45), int(width * 0.78), deck_y), fill=(68, 78, 82, 165), outline=(232, 188, 92, 170), width=2)
    draw.line((int(width * 0.58), int(height * 0.75), int(width * 0.51), height), fill=(164, 129, 67, 170), width=7)
    draw.line((int(width * 0.93), int(height * 0.75), int(width * 0.98), height), fill=(164, 129, 67, 170), width=7)


def draw_jackup(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    for x in (int(width * 0.18), int(width * 0.81)):
        draw.rectangle((x - 9, int(height * 0.1), x + 9, int(height * 0.84)), fill=(118, 124, 122, 160))
        for y in range(int(height * 0.14), int(height * 0.82), 34):
            draw.line((x - 9, y, x + 9, y + 24), fill=(224, 196, 104, 130), width=2)
    deck_y = int(height * 0.69)
    draw.rectangle((int(width * 0.10), deck_y, int(width * 0.88), int(height * 0.80)), fill=(62, 70, 72, 170), outline=(222, 181, 80, 170), width=3)
    draw.line((int(width * 0.23), deck_y, int(width * 0.55), int(height * 0.28)), fill=(202, 162, 74, 165), width=5)
    draw.line((int(width * 0.24), deck_y + 8, int(width * 0.56), int(height * 0.30)), fill=(40, 45, 48, 135), width=2)


def draw_heavy_lift(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    deck_y = int(height * 0.68)
    draw.rectangle((0, deck_y, width, height), fill=(34, 43, 48, 150))
    draw.line((int(width * 0.13), deck_y, int(width * 0.72), int(height * 0.18)), fill=(235, 187, 79, 185), width=8)
    draw.line((int(width * 0.18), deck_y, int(width * 0.77), int(height * 0.22)), fill=(40, 44, 46, 150), width=3)
    draw.rectangle((int(width * 0.40), int(height * 0.60), int(width * 0.56), deck_y), fill=(87, 92, 95, 160), outline=(238, 190, 83, 170), width=2)
    for x in range(int(width * 0.08), int(width * 0.92), 90):
        draw.line((x, deck_y - 16, x, deck_y + 4), fill=(230, 190, 80, 160), width=3)


def draw_port(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    horizon = int(height * 0.53)
    draw.rectangle((0, horizon, width, int(height * 0.61)), fill=(50, 58, 62, 90))
    for x in (int(width * 0.12), int(width * 0.32), int(width * 0.78)):
        draw.rectangle((x, horizon - 54, x + 20, horizon), fill=(66, 72, 74, 130))
        draw.line((x + 10, horizon - 54, x + 78, horizon - 92), fill=(204, 166, 78, 150), width=4)
        draw.line((x + 76, horizon - 92, x + 110, horizon - 74), fill=(204, 166, 78, 140), width=3)


def draw_monopile(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    sea_y = int(height * 0.66)
    center = int(width * 0.62)
    pile_top = int(height * 0.27)
    pile_bottom = height + 30
    draw.rounded_rectangle((center - 28, pile_top, center + 28, pile_bottom), radius=24, fill=(164, 172, 172, 170), outline=(218, 199, 152, 150), width=3)
    for offset in (-18, 0, 18):
        draw.line((center + offset, pile_top + 18, center + offset, pile_bottom), fill=(90, 101, 106, 78), width=2)
    deck_y = int(height * 0.47)
    draw.rectangle((center - 90, deck_y, center + 92, deck_y + 20), fill=(82, 87, 84, 162), outline=(229, 183, 80, 170), width=3)
    for x in range(center - 82, center + 86, 28):
        draw.line((x, deck_y - 28, x, deck_y), fill=(232, 188, 85, 150), width=3)
        draw.line((x - 6, deck_y - 25, x + 6, deck_y - 4), fill=(232, 188, 85, 110), width=1)
    draw.line((center + 44, deck_y + 20, center + 44, sea_y + 54), fill=(233, 191, 88, 160), width=4)
    for y in range(deck_y + 30, sea_y + 52, 18):
        draw.line((center + 35, y, center + 53, y), fill=(233, 191, 88, 130), width=2)


def draw_jacket_foundation(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    top_y = int(height * 0.32)
    sea_y = int(height * 0.66)
    left_top = int(width * 0.42)
    right_top = int(width * 0.58)
    left_bottom = int(width * 0.30)
    right_bottom = int(width * 0.72)
    draw.rectangle((left_top - 34, top_y - 28, right_top + 34, top_y - 8), fill=(92, 96, 94, 150), outline=(226, 184, 84, 170), width=3)
    legs = [(left_top, top_y), (right_top, top_y), (left_bottom, height + 18), (right_bottom, height + 18)]
    draw.line((legs[0][0], legs[0][1], legs[2][0], legs[2][1]), fill=(178, 184, 181, 178), width=7)
    draw.line((legs[1][0], legs[1][1], legs[3][0], legs[3][1]), fill=(178, 184, 181, 178), width=7)
    draw.line((left_top, top_y + 34, right_bottom, sea_y + 52), fill=(224, 185, 86, 150), width=4)
    draw.line((right_top, top_y + 34, left_bottom, sea_y + 52), fill=(224, 185, 86, 150), width=4)
    for level in range(top_y + 42, sea_y + 80, 54):
        t = (level - top_y) / max(1, sea_y + 80 - top_y)
        lx = int(left_top * (1 - t) + left_bottom * t)
        rx = int(right_top * (1 - t) + right_bottom * t)
        draw.line((lx, level, rx, level), fill=(224, 185, 86, 135), width=3)


def draw_floating_turbine(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    deck_y = int(height * 0.61)
    center = int(width * 0.55)
    for x in (center - 118, center, center + 118):
        draw.rounded_rectangle((x - 34, deck_y, x + 34, int(height * 0.80)), radius=18, fill=(53, 63, 69, 178), outline=(103, 186, 190, 120), width=2)
    draw.line((center - 118, deck_y + 18, center + 118, deck_y + 18), fill=(214, 178, 82, 160), width=6)
    draw.line((center - 102, int(height * 0.80), center - 190, height), fill=(116, 128, 132, 120), width=3)
    draw.line((center + 102, int(height * 0.80), center + 206, height), fill=(116, 128, 132, 120), width=3)
    tower_top = int(height * 0.19)
    draw.rounded_rectangle((center - 18, tower_top, center + 18, deck_y + 24), radius=14, fill=(185, 192, 190, 150), outline=(230, 228, 208, 130), width=2)
    draw.ellipse((center - 8, tower_top - 8, center + 8, tower_top + 8), fill=(235, 238, 232, 160))


def draw_lab(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    panel = (int(width * 0.06), int(height * 0.16), int(width * 0.94), int(height * 0.82))
    draw.rounded_rectangle(panel, radius=18, fill=(4, 16, 24, 174), outline=(76, 226, 216, 130), width=2)
    for column in range(3):
        x0 = int(width * (0.10 + column * 0.29))
        y0 = int(height * 0.23)
        x1 = x0 + int(width * 0.22)
        y1 = int(height * 0.70)
        draw.rectangle((x0, y0, x1, y1), outline=(83, 160, 170, 110), width=2)
        for row in range(4):
            y = y0 + 24 + row * 52
            draw.line((x0 + 16, y, x1 - 16, y + (row % 2) * 12 - 6), fill=(94, 238, 218, 120), width=2)
        draw.ellipse((x1 - 34, y0 + 18, x1 - 14, y0 + 38), fill=(80, 232, 184, 130))


def draw_switchgear(draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
    image_top = int(height * 0.10)
    image_bottom = int(height * 0.86)
    for column in range(5):
        x0 = int(width * (0.08 + column * 0.17))
        x1 = x0 + int(width * 0.14)
        draw.rounded_rectangle((x0, image_top, x1, image_bottom), radius=12, fill=(25, 33, 38, 188), outline=(118, 139, 144, 150), width=2)
        draw.rectangle((x0 + 16, image_top + 38, x1 - 16, image_top + 84), outline=(91, 230, 210, 120), width=2)
        draw.ellipse((x0 + 24, image_top + 116, x0 + 38, image_top + 130), fill=(80, 232, 184, 150))
        draw.ellipse((x0 + 50, image_top + 116, x0 + 64, image_top + 130), fill=(240, 181, 82, 150))


def apply_location(base: Image.Image, location: str) -> Image.Image:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    width, height = base.size
    if location == "monopile":
        draw_monopile(draw, width, height)
    elif location == "jacket_foundation":
        draw_jacket_foundation(draw, width, height)
    elif location == "floating_turbine":
        draw_floating_turbine(draw, width, height)
    elif location == "substation":
        draw_substation(draw, width, height)
    elif location == "jackup":
        draw_jackup(draw, width, height)
    elif location == "heavy_lift":
        draw_heavy_lift(draw, width, height)
    elif location == "port":
        draw_port(draw, width, height)
    elif location == "lab":
        draw_lab(draw, width, height)
    elif location == "switchgear":
        base = base.filter(ImageFilter.GaussianBlur(radius=1.0))
        draw_switchgear(draw, width, height)
    else:
        raise ValueError(f"Unknown location: {location}")
    return Image.alpha_composite(base.convert("RGBA"), layer).convert("RGB")


def main() -> None:
    base = Image.open(SOURCE).convert("RGB")
    for scene_id, (location, mood, file_name) in SCENE_VARIANTS.items():
        image = apply_mood(base, mood, seed=sum(ord(char) for char in scene_id))
        image = apply_location(image, location)
        output = OUTPUT_DIR / file_name
        image.save(output)
        print(f"{scene_id} {output.name} {image.size[0]}x{image.size[1]} {output.stat().st_size}")


if __name__ == "__main__":
    main()
