import urllib.request
import re

req = urllib.request.Request('https://sackhetechnologies.com/assets/index-45uLtgCQ.js', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    text = resp.read().decode('utf-8', errors='ignore')
    routes = re.findall(r'path:"([^"]+)"', text)
    print('Routes in original site:', set(routes))
    
    # Extract images with some context
    img_matches = set(re.findall(r'/[a-zA-Z0-9_\- &%]+\.(?:webp|png|jpg|jpeg|svg)', text))
    print(f'\nUnique image assets referenced ({len(img_matches)}):')
    for m in sorted(img_matches):
        print('  ', m)
