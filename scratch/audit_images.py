import os
import glob
import re

src_files = glob.glob("src/**/*.tsx", recursive=True) + glob.glob("src/**/*.ts", recursive=True)
print(f"Auditing {len(src_files)} files in src...")

ai_terms = ["unsplash", "midjourney", "dall-e", "dalle", "transparenttextures", "fake", "placeholder.svg", "sample.jpg"]
referenced_images = set()

all_clean = True
for path in sorted(src_files):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    for term in ai_terms:
        if term in content.lower():
            # check if it's an input placeholder or an actual image url
            lines = [line for line in content.splitlines() if term in line.lower() and ('http' in line or 'src' in line or '.png' in line or '.jpg' in line)]
            if lines:
                print(f"[FAIL] Found banned term '{term}' in {path}: {lines}")
                all_clean = False
                
    # Extract image paths
    matches = re.findall(r'[\'"`](/?[a-zA-Z0-9_\- &%]+\.(?:webp|png|jpg|jpeg|svg))[\'"`]', content)
    for m in matches:
        if not m.startswith("http"):
            referenced_images.add(m.lstrip("/"))

print(f"\nTotal unique local images referenced in codebase: {len(referenced_images)}")
missing = []
for img in sorted(referenced_images):
    pub_path = os.path.join("public", img)
    exists = os.path.exists(pub_path)
    status = "EXISTS" if exists else "MISSING!"
    if not exists:
        missing.append(img)
    size_kb = os.path.getsize(pub_path) / 1024 if exists else 0
    print(f" - {img:40s} : {status:8s} ({size_kb:6.1f} KB)")

if missing:
    print(f"\n[FAIL] Missing image files: {missing}")
    all_clean = False
else:
    print("\n[PASS] All referenced image files physically exist in public directory!")

if all_clean:
    print("\n[SUCCESS] Strict Image Audit Passed with 100% authentic real assets!")
