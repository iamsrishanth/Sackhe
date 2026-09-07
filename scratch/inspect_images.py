import os
import glob
from PIL import Image

pub_files = glob.glob("public/*.*")
print(f"Total files in public: {len(pub_files)}")
for f in sorted(pub_files):
    name = os.path.basename(f)
    size = os.path.getsize(f)
    dim = ""
    try:
        with Image.open(f) as img:
            dim = f"{img.size[0]}x{img.size[1]} ({img.format})"
    except Exception as e:
        dim = f"n/a ({e})"
    print(f"{name:40s} | {size/1024:6.1f} KB | {dim}")
