import os
import math
from PIL import Image, ImageDraw

dest_dirs = [
    "/Users/yasinkaya/Downloads/untitled folder 4/lexicon_survivors/assets/sprites",
    "/Users/yasinkaya/Downloads/untitled folder 4/lexicon_survivors/build/web/assets/sprites"
]

def save_to_both(im, filename):
    for d in dest_dirs:
        os.makedirs(d, exist_ok=True)
        im.save(os.path.join(d, filename))
    print(f"✓ Saved {filename}")

# 1. PLAYER SORCERESS (48x48)
def make_sorceress():
    im = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Arcane glow aura
    d.ellipse((10, 8, 38, 44), fill=(168, 85, 247, 45))
    # Cloak / Robe
    d.polygon([(24, 14), (12, 42), (36, 42)], fill=(126, 34, 206, 255))
    d.polygon([(24, 18), (16, 42), (32, 42)], fill=(147, 51, 234, 255))
    # Robe trim
    d.line([(12, 42), (36, 42)], fill=(245, 158, 11, 255), width=2)
    d.line([(24, 18), (24, 42)], fill=(216, 180, 254, 255), width=1)
    # Hood & Head
    d.ellipse((16, 8, 32, 24), fill=(107, 33, 168, 255))
    d.ellipse((18, 11, 30, 22), fill=(147, 51, 234, 255))
    # Face shadow & glowing eyes
    d.rectangle((20, 14, 28, 19), fill=(46, 16, 101, 255))
    d.rectangle((21, 15, 23, 17), fill=(244, 114, 182, 255)) # Glowing left eye
    d.rectangle((25, 15, 27, 17), fill=(244, 114, 182, 255)) # Glowing right eye
    # Gold Tiara
    d.line([(18, 12), (24, 9), (30, 12)], fill=(251, 191, 36, 255), width=2)
    d.point((24, 8), fill=(244, 63, 94, 255)) # Tiara gem
    # Floating Arcane Orb (Staff / Hand)
    d.ellipse((33, 18, 43, 28), fill=(192, 132, 252, 120))
    d.ellipse((35, 20, 41, 26), fill=(236, 72, 153, 255))
    d.point((37, 22), fill=(255, 255, 255, 255))
    return im

# 2. PLAYER ALCHEMIST (48x48)
def make_alchemist():
    im = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Subtle emerald aura
    d.ellipse((10, 8, 38, 44), fill=(16, 185, 129, 40))
    # Coat body
    d.polygon([(24, 16), (13, 42), (35, 42)], fill=(4, 120, 87, 255))
    d.polygon([(24, 19), (17, 42), (31, 42)], fill=(5, 150, 105, 255))
    # Leather apron / belt bandolier
    d.line([(15, 26), (33, 34)], fill=(120, 53, 15, 255), width=3)
    # Vials on belt
    d.rectangle((17, 27, 19, 31), fill=(6, 182, 212, 255)) # Cyan vial
    d.rectangle((21, 29, 23, 33), fill=(244, 63, 94, 255)) # Crimson vial
    d.rectangle((25, 31, 27, 35), fill=(234, 179, 8, 255)) # Gold vial
    # Scholar Hat & Goggles
    d.polygon([(14, 15), (24, 6), (34, 15)], fill=(63, 63, 70, 255))
    d.rectangle((16, 14, 32, 17), fill=(120, 53, 15, 255)) # Leather brim
    # Brass Goggles
    d.ellipse((18, 14, 23, 19), fill=(217, 119, 6, 255))
    d.ellipse((19, 15, 22, 18), fill=(56, 189, 248, 255))
    d.ellipse((25, 14, 30, 19), fill=(217, 119, 6, 255))
    d.ellipse((26, 15, 29, 18), fill=(56, 189, 248, 255))
    # Face
    d.rectangle((20, 20, 28, 24), fill=(254, 215, 170, 255))
    # Bubbling conical potion flask in right hand
    d.polygon([(36, 28), (42, 38), (32, 38)], fill=(16, 185, 129, 220))
    d.rectangle((36, 24, 38, 28), fill=(229, 231, 235, 255)) # Cork/neck
    d.point((37, 33), fill=(255, 255, 255, 255)) # bubble highlight
    return im

# 3. PLAYER ASSASSIN (48x48)
def make_assassin():
    im = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Shadow mist aura
    d.ellipse((8, 10, 40, 44), fill=(15, 23, 42, 70))
    # Ninja / Assassin Robe
    d.polygon([(24, 15), (12, 42), (36, 42)], fill=(15, 23, 42, 255))
    d.polygon([(24, 18), (16, 42), (32, 42)], fill=(30, 41, 59, 255))
    # Crimson Sash & Scarf flowing
    d.rectangle((18, 27, 30, 31), fill=(190, 18, 60, 255))
    d.polygon([(18, 30), (8, 38), (14, 43)], fill=(225, 29, 72, 255)) # scarf tail
    # Cowl & Mask
    d.ellipse((16, 8, 32, 24), fill=(15, 23, 42, 255))
    d.rectangle((19, 17, 29, 24), fill=(30, 41, 59, 255)) # mask
    # Piercing Crimson Eyes
    d.rectangle((20, 14, 23, 16), fill=(244, 63, 94, 255))
    d.rectangle((25, 14, 28, 16), fill=(244, 63, 94, 255))
    d.point((21, 15), fill=(255, 255, 255, 255))
    d.point((26, 15), fill=(255, 255, 255, 255))
    # Dual Calligraphy Blades / Kunai
    d.polygon([(34, 22), (44, 26), (36, 29)], fill=(226, 232, 240, 255))
    d.polygon([(14, 22), (4, 26), (12, 29)], fill=(226, 232, 240, 255))
    return im

# 4. TILE DUNGEON STONE (64x64)
def make_dungeon_stone():
    im = Image.new("RGBA", (64, 64), (20, 24, 33, 255))
    d = ImageDraw.Draw(im)
    # Flagstones pattern
    # Big stones
    d.rectangle((2, 2, 30, 30), fill=(28, 34, 46, 255), outline=(12, 16, 22, 255), width=2)
    d.rectangle((34, 2, 62, 30), fill=(32, 39, 53, 255), outline=(12, 16, 22, 255), width=2)
    d.rectangle((2, 34, 62, 62), fill=(25, 30, 42, 255), outline=(12, 16, 22, 255), width=2)
    # Subtle cyan rune carving in stone 1
    d.line([(8, 10), (14, 22), (20, 10)], fill=(6, 182, 212, 120), width=1)
    d.line([(10, 16), (18, 16)], fill=(6, 182, 212, 120), width=1)
    # Subtle cyan rune in stone 2
    d.ellipse((42, 10, 54, 22), outline=(6, 182, 212, 110), width=1)
    d.line([(48, 6), (48, 26)], fill=(6, 182, 212, 110), width=1)
    # Stone texture cracks
    d.line([(12, 45), (28, 52), (45, 48)], fill=(15, 20, 28, 255), width=1)
    return im

# 5. MAGICAL RUNE CYAN (512x512)
def make_cyan_rune():
    im = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, cy = 256, 256
    # Outer glowing circles
    for r, a, w in [(240, 60, 6), (232, 180, 4), (210, 120, 2), (180, 220, 3), (120, 150, 2), (70, 240, 3)]:
        d.ellipse((cx-r, cy-r, cx+r, cy+r), outline=(6, 182, 212, a), width=w)
    # 8-point Arcane Star
    points = []
    for i in range(16):
        ang = (i / 16) * math.pi * 2
        rad = 180 if i % 2 == 0 else 90
        points.append((cx + math.cos(ang) * rad, cy + math.sin(ang) * rad))
    d.polygon(points, outline=(34, 211, 238, 190), width=2)
    # Inner octagram
    for i in range(8):
        ang = (i / 8) * math.pi * 2
        d.line([(cx, cy), (cx + math.cos(ang) * 230, cy + math.sin(ang) * 230)], fill=(6, 182, 212, 100), width=1)
        # Glyph dots
        gx = cx + math.cos(ang + 0.39) * 220
        gy = cy + math.sin(ang + 0.39) * 220
        d.ellipse((gx-6, gy-6, gx+6, gy+6), fill=(165, 243, 252, 220))
    # Central mystic core
    d.ellipse((cx-35, cy-35, cx+35, cy+35), fill=(8, 145, 178, 160), outline=(207, 250, 254, 255), width=3)
    return im

# 6. TILE ASTRAL OBSERVATORY (64x64)
def make_astral_tile():
    im = Image.new("RGBA", (64, 64), (10, 15, 30, 255))
    d = ImageDraw.Draw(im)
    # Deep midnight tile with gold border
    d.rectangle((1, 1, 62, 62), fill=(15, 23, 42, 255), outline=(212, 175, 55, 160), width=1)
    d.rectangle((5, 5, 58, 58), outline=(139, 92, 246, 70), width=1)
    # Star constellation dots
    stars = [(12, 18), (24, 14), (38, 22), (50, 16), (28, 44), (46, 48), (16, 52)]
    for sx, sy in stars:
        d.ellipse((sx-1, sy-1, sx+1, sy+1), fill=(253, 224, 71, 240))
    # Constellation lines
    d.line([(12, 18), (24, 14), (38, 22), (50, 16)], fill=(253, 224, 71, 70), width=1)
    d.line([(24, 14), (28, 44), (46, 48)], fill=(253, 224, 71, 70), width=1)
    return im

# 7. MAGICAL RUNE ASTRAL (512x512)
def make_astral_rune():
    im = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, cy = 256, 256
    # Golden Astrolabe Rings
    for r, a, w in [(240, 120, 3), (225, 220, 4), (210, 90, 1), (170, 200, 3), (130, 140, 2), (60, 240, 3)]:
        d.ellipse((cx-r, cy-r, cx+r, cy+r), outline=(245, 158, 11, a), width=w)
    # 12 Zodiac ticks & radiant compass spokes
    for i in range(12):
        ang = (i / 12) * math.pi * 2
        d.line([(cx + math.cos(ang) * 170, cy + math.sin(ang) * 170),
                (cx + math.cos(ang) * 225, cy + math.sin(ang) * 225)], fill=(251, 191, 36, 220), width=2)
        # Star marker
        sx = cx + math.cos(ang + 0.26) * 195
        sy = cy + math.sin(ang + 0.26) * 195
        d.ellipse((sx-4, sy-4, sx+4, sy+4), fill=(254, 240, 138, 255))
    # Sun & Moon Core
    d.ellipse((cx-40, cy-40, cx+40, cy+40), fill=(180, 83, 9, 140), outline=(253, 224, 71, 255), width=3)
    d.ellipse((cx-20, cy-20, cx+20, cy+20), fill=(253, 224, 71, 230))
    return im

save_to_both(make_sorceress(), "player_sorceress.png")
save_to_both(make_alchemist(), "player_alchemist.png")
save_to_both(make_assassin(), "player_assassin.png")
save_to_both(make_dungeon_stone(), "tile_dungeon_stone.png")
save_to_both(make_cyan_rune(), "magical_rune_cyan.png")
save_to_both(make_astral_tile(), "tile_astral_observatory.png")
save_to_both(make_astral_rune(), "magical_rune_astral.png")
print("All v6 assets generated successfully!")
