from PIL import Image

for name in ["Home View2.webp", "Home View1.webp", "Solid Waste Management System.webp", "premium-pad.webp"]:
    with Image.open(f"public/{name}") as img:
        print(f"{name}: Mode={img.mode}, Size={img.size}")
        # check alpha at corners
        c0 = img.getpixel((0, 0))
        center = img.getpixel((img.size[0]//2, img.size[1]//2))
        print(f"  Corner (0,0) pixel: {c0}")
        print(f"  Center pixel: {center}")
