import urllib.request
import os

# Let's inspect Home View2.webp and other images
# Let's check with PIL or pure python
# First let's install pillow or check if python has image libraries or use python script with PIL/cv2
print("Checking python modules...")
try:
    import PIL
    from PIL import Image
    print("PIL is available:", PIL.__version__)
except ImportError:
    print("PIL not available, will install or use script")
