from PIL import Image, ImageFilter
import numpy as np

def make_transparent_edge_flood(input_path, output_path, tolerance=25, blur_radius=1):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Identify background starting from the border pixels
    # Calculate difference from pure white (255, 255, 255)
    # The background is nearly white (e.g. > 235 on all channels)
    is_light = (r > 235) & (g > 235) & (b > 235)
    
    # Use scipy or flood fill from corners to only remove connected background
    # so we don't accidentally remove internal white parts of the product if any!
    from collections import deque
    h, w = is_light.shape
    visited = np.zeros((h, w), dtype=bool)
    mask = np.zeros((h, w), dtype=bool)
    
    queue = deque()
    
    # Add all border pixels that are light
    for x in range(w):
        if is_light[0, x]: queue.append((0, x)); visited[0, x] = True
        if is_light[h-1, x]: queue.append((h-1, x)); visited[h-1, x] = True
    for y in range(h):
        if is_light[y, 0]: queue.append((y, 0)); visited[y, 0] = True
        if is_light[y, w-1]: queue.append((y, w-1)); visited[y, w-1] = True
        
    while queue:
        cy, cx = queue.popleft()
        mask[cy, cx] = True
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                visited[ny, nx] = True
                # if pixel is light or close to white
                if is_light[ny, nx] or (r[ny, nx] > 230 and g[ny, nx] > 230 and b[ny, nx] > 230):
                    queue.append((ny, nx))
                    
    # Smooth the mask edge slightly for clean antialiased transparency
    mask_img = Image.fromarray((mask * 255).astype(np.uint8))
    # Invert mask so product is white (255) and background is black (0)
    product_alpha = Image.fromarray(((~mask) * 255).astype(np.uint8))
    product_alpha = product_alpha.filter(ImageFilter.GaussianBlur(radius=0.5))
    
    # Set the alpha channel
    img.putalpha(product_alpha)
    img.save(output_path, "WEBP", quality=95)
    print(f"Saved transparent image: {output_path} (size {img.size})")

# Process the product photographs
make_transparent_edge_flood("public/Home View2.webp", "public/Home View2.webp")
make_transparent_edge_flood("public/Home View1.webp", "public/Home View1.webp")
make_transparent_edge_flood("public/Solid Waste Management System.webp", "public/Solid Waste Management System.webp")
print("All product images processed successfully!")
