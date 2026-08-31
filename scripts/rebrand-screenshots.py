"""Replace browser-product branding in screenshots with the official Astra logo."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = ROOT / "src/assets/logo.png"
SCREENSHOTS_DIR = ROOT / "src/assets/screenshots"


def paste_logo(
    base: Image.Image, x: int, y: int, size: int, bg: tuple[int, int, int] | None
) -> Image.Image:
    im = base.copy()
    if bg is not None:
        draw = ImageDraw.Draw(im)
        draw.rectangle([x, y, x + size, y + size], fill=bg)
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo = logo.resize((size, size), Image.Resampling.LANCZOS)
    im.paste(logo, (x, y), logo)
    return im


def paste_logo_centered_in_box(
    base: Image.Image,
    x: int,
    y: int,
    box: int,
    logo_size: int,
    bg: tuple[int, int, int],
) -> Image.Image:
    im = base.copy()
    draw = ImageDraw.Draw(im)
    draw.rectangle([x, y, x + box, y + box], fill=bg)
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    lx = x + (box - logo_size) // 2
    ly = y + (box - logo_size) // 2
    im.paste(logo, (lx, ly), logo)
    return im


def rebrand_boost(path: Path) -> None:
    im = Image.open(path)
    placements = [
        (8, 8, 32, (35, 34, 40)),
        (14, 48, 16, (35, 34, 40)),
        (750, 10, 24, (35, 34, 40)),
    ]
    for x, y, size, bg in placements:
        im = paste_logo(im, x, y, size, bg)
    im = paste_logo_centered_in_box(im, 768, 68, 88, 72, (45, 44, 50))
    im.save(path)


def rebrand_astra_ui(path: Path) -> None:
    im = Image.open(path)
    bg = (245, 243, 250)
    placements = [
        (8, 8, 32, bg),
        (14, 56, 16, bg),
    ]
    for x, y, size, placement_bg in placements:
        im = paste_logo(im, x, y, size, placement_bg)
    im.save(path)


def main() -> None:
    rebrand_boost(SCREENSHOTS_DIR / "boost.png")
    rebrand_astra_ui(SCREENSHOTS_DIR / "astra-browser-ui.png")
    print("Rebranded boost.png and astra-browser-ui.png")


if __name__ == "__main__":
    main()
