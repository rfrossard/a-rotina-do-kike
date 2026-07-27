from pathlib import Path
from collections import deque

from PIL import Image


SOURCE = Path("public/kike-yorkie-sprites-20.png")
TARGET = Path("public/kike-yorkie-sprites-20-fitted.png")
COLS = 5
ROWS = 4
CELL = 320
MAX_WIDTH = 244
MAX_HEIGHT = 254


source = Image.open(SOURCE).convert("RGBA")
sheet = Image.new("RGBA", (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))


def keep_largest_component(sprite: Image.Image) -> Image.Image:
    width, height = sprite.size
    alpha = sprite.getchannel("A")
    pixels = alpha.load()
    visited = bytearray(width * height)
    largest: list[tuple[int, int]] = []

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if visited[index] or pixels[x, y] <= 8:
                continue
            visited[index] = 1
            queue = deque([(x, y)])
            component: list[tuple[int, int]] = []
            while queue:
                current_x, current_y = queue.popleft()
                component.append((current_x, current_y))
                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                ):
                    if not (0 <= next_x < width and 0 <= next_y < height):
                        continue
                    next_index = next_y * width + next_x
                    if visited[next_index] or pixels[next_x, next_y] <= 8:
                        continue
                    visited[next_index] = 1
                    queue.append((next_x, next_y))
            if len(component) > len(largest):
                largest = component

    mask = Image.new("L", sprite.size, 0)
    mask_pixels = mask.load()
    for x, y in largest:
        mask_pixels[x, y] = pixels[x, y]
    cleaned = sprite.copy()
    cleaned.putalpha(mask)
    return cleaned


for row in range(ROWS):
    for col in range(COLS):
        left = round(col * source.width / COLS)
        top = round(row * source.height / ROWS)
        right = round((col + 1) * source.width / COLS)
        bottom = round((row + 1) * source.height / ROWS)
        sprite = source.crop((left, top, right, bottom))
        sprite = keep_largest_component(sprite)
        alpha = sprite.getchannel("A")
        bounds = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
        if not bounds:
            continue
        sprite = sprite.crop(bounds)
        scale = min(MAX_WIDTH / sprite.width, MAX_HEIGHT / sprite.height)
        sprite = sprite.resize(
            (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale))),
            Image.Resampling.LANCZOS,
        )
        x = col * CELL + (CELL - sprite.width) // 2
        y = row * CELL + CELL - sprite.height - 24
        sheet.alpha_composite(sprite, (x, y))

sheet.save(TARGET, optimize=True)
print(TARGET)
