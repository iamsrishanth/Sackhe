import urllib.request
import re
import json

req = urllib.request.Request('https://sackhetechnologies.com/assets/index-45uLtgCQ.js', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    text = resp.read().decode('utf-8', errors='ignore')

# Let's find products array, services array, initiatives array, about text, etc.
print("=== Search for Products ===")
matches = re.findall(r'products\s*=\s*(\[[^\]]+\])', text)
for m in matches[:5]:
    print(m[:300])

print("\n=== Search for Services ===")
matches = re.findall(r'services\s*=\s*(\[[^\]]+\])', text)
for m in matches[:5]:
    print(m[:300])

print("\n=== Search for Contact Info ===")
emails = set(re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text))
print("Emails:", emails)
phones = set(re.findall(r'\+91[\s\d-]+', text))
print("Phones:", phones)

print("\n=== Search for Initiatives ===")
matches = re.findall(r'initiatives\s*=\s*(\[[^\]]+\])', text)
for m in matches[:5]:
    print(m[:300])
