import urllib.request
import re
import os
import json

url = "https://sackhetechnologies.com/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        print("HTML length:", len(html))
        scripts = re.findall(r'src=["\'](/assets/[^"\']+)["\']', html)
        print("Found scripts:", scripts)
        
        all_images = set()
        for s in scripts:
            js_url = "https://sackhetechnologies.com" + s
            print("Fetching JS:", js_url)
            js_req = urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(js_req) as js_resp:
                js_text = js_resp.read().decode('utf-8', errors='ignore')
                # find strings with image extensions
                found = re.findall(r'["\']([^"\']+\.(?:webp|png|jpg|jpeg|svg))["\']', js_text)
                for f in found:
                    all_images.add(f)
        
        print("\nAll image references found in live site bundles:")
        for img in sorted(all_images):
            print(" -", img)
            
except Exception as e:
    print("Error:", e)
