from PIL import Image
import os
import shutil

SRC = os.path.join("rawy", "assets", "images", "adaptive-icon.png")
BAK = SRC + ".bak"

if not os.path.exists(SRC):
    print(f"Source not found: {SRC}")
    raise SystemExit(1)

if not os.path.exists(BAK):
    shutil.copy2(SRC, BAK)

img = Image.open(SRC).convert("RGBA")
alpha = img.split()[-1]
bbox = alpha.getbbox()

if bbox:
    content = img.crop(bbox)
else:
    content = img

TARGET = (1024, 1024)
SCALE = 0.60

max_w = int(TARGET[0] * SCALE)
max_h = int(TARGET[1] * SCALE)

ratio = min(max_w / content.width, max_h / content.height)
new_size = (max(1, int(content.width * ratio)), max(1, int(content.height * ratio)))

resized = content.resize(new_size, Image.LANCZOS)

canvas = Image.new("RGBA", TARGET, (0, 0, 0, 0))
pos = ((TARGET[0] - new_size[0]) // 2, (TARGET[1] - new_size[1]) // 2)
canvas.paste(resized, pos, resized)

canvas.save(SRC)
print(f"Resized and saved: {SRC} (backup at {BAK})")
