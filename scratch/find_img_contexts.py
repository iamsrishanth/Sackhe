import urllib.request
import re

req = urllib.request.Request('https://sackhetechnologies.com/assets/index-45uLtgCQ.js', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    text = resp.read().decode('utf-8', errors='ignore')

# Search for function components or route components
print("Length of bundle:", len(text))

# Let's search for occurrences of /Home View, /Solid, /premium, /Team, /1.webp, etc.
for img in ["Home View", "Solid Waste", "premium-pad", "Team", "1.webp", "Girls Schools", "Sandhya"]:
    pos = 0
    print(f"\n=== Occurrences of '{img}' ===")
    while True:
        idx = text.find(img, pos)
        if idx == -1:
            break
        start = max(0, idx - 150)
        end = min(len(text), idx + 250)
        print(text[start:end])
        print("-" * 50)
        pos = idx + len(img)
