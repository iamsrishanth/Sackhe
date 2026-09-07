import os, glob

# Let's inspect the file headers or see what images exist
files = sorted(glob.glob("public/*.webp"))
print("All webp images in public:")
for f in files:
    size = os.path.getsize(f)
    print(f"{os.path.basename(f)}: {size:,} bytes")
