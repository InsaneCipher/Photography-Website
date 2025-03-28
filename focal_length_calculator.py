from PIL import Image
from PIL.ExifTags import TAGS
import os
from dotenv import load_dotenv

load_dotenv()  # loads from .env automatically


def get_focal_length(img_path):
    try:
        img = Image.open(img_path)
        exif_data = img._getexif()
        if not exif_data:
            return None
        for tag_id, value in exif_data.items():
            tag = TAGS.get(tag_id, tag_id)
            if tag == "FocalLength":
                if isinstance(value, tuple):
                    return round(value[0] / value[1], 2)
                return value
    except Exception as e:
        print(f"Error with {img_path}: {e}")
    return None


# Store results
focal_lengths = []

# Folder path
folder_path = os.getenv("folder_path")

# Walk through all subdirectories
for root, dirs, files in os.walk(folder_path):
    for filename in files:
        if filename.lower().endswith((".jpg", ".jpeg")):
            path = os.path.join(root, filename)
            focal_length = get_focal_length(path)
            if focal_length is not None and focal_length >= 18:
                focal_lengths.append((filename, focal_length))

# Sort by focal length in descending order
focal_lengths.sort(key=lambda x: x[1], reverse=True)

# Count ranges
less_than_70 = sum(1 for _, fl in focal_lengths if fl < 70)
less_than_105 = sum(1 for _, fl in focal_lengths if fl < 105)

# Print focal lengths
print("Focal lengths found in images (descending):\n")
for i, (filename, focal_length) in enumerate(focal_lengths, start=1):
    print(f"{i}. {filename}: {focal_length}mm")

# Print summary
print("\nSummary:")
print(f"Folder: {folder_path}")
print(f"Total images analyzed (≥18mm only): {len(focal_lengths)}")
print(f"Images with focal length < 70mm: {less_than_70}")
print(f"Images with focal length < 105mm: {less_than_105}")
