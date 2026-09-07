import urllib.request
import re

req = urllib.request.Request('https://sackhetechnologies.com/assets/index-45uLtgCQ.js', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    text = resp.read().decode('utf-8', errors='ignore')

# Let's search for team names, services, initiatives, quotes, products, specs, mission, vision, etc.
sections = re.findall(r'(\{[^{}]{30,300}\.(?:webp|png|jpg)[^{}]{0,300}\})', text)
print(f"Found {len(sections)} object literals with images:")
for s in sections[:25]:
    print("---")
    print(s)
