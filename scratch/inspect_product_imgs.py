from PIL import Image
import os

images = ["Home View2.webp", "Home View1.webp", "4 View Sides.webp", "Solid Waste Management System.webp", "premium-pad.webp"]

for img_name in images:
    path = os.path.join("public", img_name)
    if os.path.exists(path):
        with Image.open(path) as img:
            print(f"\n{img_name}:")
            print(f"  Format: {img.format}, Mode: {img.mode}, Size: {img.size}")
            # check corner pixels
            corners = [
                img.getpixel((0, 0)),
                img.getpixel((img.size[0] - 1, 0)),
                img.getpixel((0, img.size[1] - 1)),
                img.getpixel((img.size[0] - 1, img.size[1] - 1))
            ]
            print(f"  Corners: {corners}")
