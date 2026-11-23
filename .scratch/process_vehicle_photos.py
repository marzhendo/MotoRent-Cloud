from PIL import Image, ImageOps, ImageFilter
import os

raw_dir = ".scratch/raw_vehicles"
out_dir = "frontend/public/vehicles"
os.makedirs(out_dir, exist_ok=True)

# Configurations for optimal framing of each vehicle
# (target_width, target_height)
TARGET_SIZE = (800, 480)

vehicles = [
    {
        "input": "yamaha-nmax.jpg",
        "output_base": "yamaha-nmax",
        # Box to focus on vehicle if needed, or smart crop
        "crop_box": None, 
    },
    {
        "input": "toyota-avanza.jpg",
        "output_base": "toyota-avanza",
        "crop_box": None,
    },
    {
        "input": "mitsubishi-xpander.jpg",
        "output_base": "mitsubishi-xpander",
        "crop_box": None,
    },
    {
        "input": "honda-beat.jpg",
        "output_base": "honda-beat",
        "crop_box": None,
    },
    {
        "input": "honda-vario.jpg",
        "output_base": "honda-vario",
        "crop_box": None,
    }
]

for v in vehicles:
    in_path = os.path.join(raw_dir, v["input"])
    if not os.path.exists(in_path):
        print(f"File not found: {in_path}")
        continue

    img = Image.open(in_path)
    img = ImageOps.exif_transpose(img) # Ensure correct orientation

    # Convert to RGB
    if img.mode != "RGB":
        img = img.convert("RGB")

    # Fit image neatly into 800x480 using high-quality Lanczos centering
    fitted = ImageOps.fit(img, TARGET_SIZE, method=Image.Resampling.LANCZOS, centering=(0.5, 0.55))

    # Save as PNG
    png_path = os.path.join(out_dir, f"{v['output_base']}.png")
    fitted.save(png_path, "PNG", optimize=True)

    # Save as WebP (ultra fast loading)
    webp_path = os.path.join(out_dir, f"{v['output_base']}.webp")
    fitted.save(webp_path, "WEBP", quality=90)

    print(f"Processed {v['output_base']}: PNG={os.path.getsize(png_path)} bytes, WebP={os.path.getsize(webp_path)} bytes")

print("All vehicle photography processed successfully!")
