import os
import shutil

# Check problematic filenames in public
files = os.listdir("public")
for f in files:
    if " " in f or ".." in f:
        print("Filename with space or double dot:", repr(f))
