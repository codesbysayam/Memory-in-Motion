import struct
import zlib
import os

def create_png(width, height, get_pixel_func, output_path):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel_func(x, y, width, height)
            raw_data.extend((r, g, b, a))

    def chunk(tag, data):
        crc = zlib.crc32(tag + data) & 0xffffffff
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', crc)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    compressed_idat = zlib.compress(bytes(raw_data), level=6)

    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed_idat) + chunk(b'IEND', b'')

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(png)
    print(f"Created {output_path} ({width}x{height}, {len(png)} bytes)")

# 1. Favicon 32x32: Academic Navy with Gold and Green accent
def favicon_pixel(x, y, w, h):
    # Rounded rect background
    dx = min(x, w - 1 - x)
    dy = min(y, h - 1 - y)
    r = 6
    if dx < r and dy < r:
        dist_sq = (r - dx)**2 + (r - dy)**2
        if dist_sq > r**2:
            return (0, 0, 0, 0) # Transparent
    
    # Border
    if x == 0 or x == w - 1 or y == 0 or y == h - 1:
        return (43, 96, 143, 255)
    
    # 'M' shape in white
    # Left stem: x in [7, 9], y in [10, 24]
    # Right stem: x in [22, 24], y in [10, 24]
    # Center vertex: around (16, 19)
    if (7 <= x <= 9 and 10 <= y <= 24) or (22 <= x <= 24 and 10 <= y <= 24):
        return (255, 255, 255, 255)
    
    # Diagonals
    if (10 <= x <= 16 and y == 10 + (x - 10) * 1.4) or (16 <= x <= 21 and y == 19 - (x - 16) * 1.4):
        return (255, 255, 255, 255)
    if (10 <= x <= 16 and abs(y - (10 + (x - 10) * 1.4)) <= 1.2) or (16 <= x <= 21 and abs(y - (19 - (x - 16) * 1.4)) <= 1.2):
        return (255, 255, 255, 255)

    # Gold dot at (16, 23)
    if (x - 16)**2 + (y - 23)**2 <= 3:
        return (226, 186, 112, 255)

    # Base background: Academic navy (#1B4D7E)
    return (27, 77, 126, 255)

create_png(32, 32, favicon_pixel, 'public/favicon-32x32.png')

# 2. Apple Touch Icon 180x180
def apple_icon_pixel(x, y, w, h):
    # Rounded rect background
    dx = min(x, w - 1 - x)
    dy = min(y, h - 1 - y)
    r = 32
    if dx < r and dy < r:
        dist_sq = (r - dx)**2 + (r - dy)**2
        if dist_sq > r**2:
            return (0, 0, 0, 0)
    
    # Scale coordinates to 32x32 equivalent
    fx = x / 180 * 32
    fy = y / 180 * 32

    # Draw M stem left: fx in [7, 10], fy in [9, 24]
    if (7 <= fx <= 10 and 9 <= fy <= 24) or (22 <= fx <= 25 and 9 <= fy <= 24):
        return (255, 255, 255, 255)

    # Diagonal strokes
    diag1 = abs(fy - (9 + (fx - 10) * 1.6))
    diag2 = abs(fy - (19 - (fx - 16) * 1.6))
    if (9.5 <= fx <= 16 and diag1 < 1.4) or (16 <= fx <= 22.5 and diag2 < 1.4):
        return (255, 255, 255, 255)

    # Gold accent ring & Green node
    dist_node = (fx - 16)**2 + (fy - 23)**2
    if dist_node <= 4.0:
        return (46, 125, 78, 255) # Green
    if 4.0 < dist_node <= 8.0:
        return (226, 186, 112, 255) # Gold

    return (27, 77, 126, 255) # #1B4D7E

create_png(180, 180, apple_icon_pixel, 'public/apple-touch-icon.png')

# 3. OG Social Preview Image: 1200 x 630
def og_pixel(x, y, w, h):
    # Background gradient from #0A1724 at top left to #16324D at center/bottom
    center_dist = ((x - 700)**2 + (y - 300)**2)**0.5
    t = min(1.0, center_dist / 800.0)
    
    r = int(12 * t + 22 * (1 - t))
    g = int(24 * t + 55 * (1 - t))
    b = int(38 * t + 88 * (1 - t))

    # Grid lines every 60px
    if (x % 60 == 0 or y % 60 == 0) and (x > 60 and x < w - 60 and y > 60 and y < h - 60):
        r = min(255, r + 15)
        g = min(255, g + 25)
        b = min(255, b + 40)

    # Right side: Matrix preview card boundary [720, 100] to [1120, 500]
    if 720 <= x <= 1120 and 100 <= y <= 500:
        # Card inner
        card_x = x - 720
        card_y = y - 100
        # Border
        if card_x in (0, 1, 399, 400) or card_y in (0, 1, 399, 400):
            return (43, 96, 143, 255)
        
        # Matrix cells inside card: 4x4 blocks of size 70 with 15px gap
        mx = card_x - 40
        my = card_y - 40
        if 0 <= mx < 325 and 0 <= my < 325:
            col = mx // 85
            row = my // 85
            in_cell_x = mx % 85
            in_cell_y = my % 85
            if in_cell_x < 70 and in_cell_y < 70:
                # Colors based on associative weight intensity
                weights = [
                    [(30, 82, 125), (14, 45, 74), (217, 119, 6), (19, 61, 99)],
                    [(14, 45, 74), (22, 124, 128), (19, 61, 99), (36, 122, 75)],
                    [(217, 119, 6), (19, 61, 99), (43, 108, 176), (14, 45, 74)],
                    [(19, 61, 99), (36, 122, 75), (14, 45, 74), (226, 186, 112)],
                ]
                cell_color = weights[row % 4][col % 4]
                return (cell_color[0], cell_color[1], cell_color[2], 255)
        
        return (10, 22, 34, 255)

    # Outer border accent
    if x in (20, w - 21) or y in (20, h - 21):
        return (43, 96, 143, 180)

    return (r, g, b, 255)

create_png(1200, 630, og_pixel, 'public/og/memory-in-motion.png')
print("All PNG assets successfully generated!")
