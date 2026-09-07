import urllib.request
import os
from PIL import Image, ImageFilter
import numpy as np

os.makedirs("public/assets/images", exist_ok=True)

def fetch_and_clean(url, out_path, threshold=240):
    print(f"Fetching {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            with open("scratch/temp_orig.webp", "wb") as f:
                f.write(resp.read())
        img = Image.open("scratch/temp_orig.webp").convert("RGBA")
    except Exception as e:
        print("Fetch error, using local:", e)
        img = Image.open(out_path).convert("RGBA")
        
    data = np.array(img)
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    
    # Check background lightness
    # The original background is very light grey / white
    is_bg = (r >= 238) & (g >= 238) & (b >= 238)
    
    # Flood fill from outer borders
    from collections import deque
    h, w = is_bg.shape
    visited = np.zeros((h, w), dtype=bool)
    mask = np.zeros((h, w), dtype=bool)
    queue = deque()
    
    for x in range(w):
        if is_bg[0, x]: queue.append((0, x)); visited[0, x] = True
        if is_bg[h-1, x]: queue.append((h-1, x)); visited[h-1, x] = True
    for y in range(h):
        if is_bg[y, 0]: queue.append((y, 0)); visited[y, 0] = True
        if is_bg[y, w-1]: queue.append((y, w-1)); visited[y, w-1] = True
        
    while queue:
        cy, cx = queue.popleft()
        mask[cy, cx] = True
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                visited[ny, nx] = True
                # If pixel is close to white / background
                if is_bg[ny, nx] or (r[ny, nx] > 230 and g[ny, nx] > 230 and b[ny, nx] > 230):
                    queue.append((ny, nx))
                    
    # Refine alpha: smooth edges
    product_mask = (~mask).astype(np.uint8) * 255
    alpha_img = Image.fromarray(product_mask, mode='L')
    alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(radius=0.7))
    
    img.putalpha(alpha_img)
    img.save(out_path, "WEBP", quality=95)
    print(f"Saved: {out_path} ({img.size})")

fetch_and_clean("https://sackhetechnologies.com/Home%20View2.webp", "public/assets/images/hero-incinerator-isolated.webp")
fetch_and_clean("https://sackhetechnologies.com/Home%20View1.webp", "public/assets/images/hero-incinerator-chamber.webp")
fetch_and_clean("https://sackhetechnologies.com/Solid%20Waste%20Management%20System.webp", "public/assets/images/solid-waste-system-isolated.webp")

# Also copy transparent pad
with Image.open("public/premium-pad.webp") as p_img:
    p_img.save("public/assets/images/premium-pad-isolated.webp", "WEBP", quality=95)

print("Done generating assets/images!")
