import os
import shutil
import zipfile
from pathlib import Path
from PIL import Image

def main():
    src_dir = Path("docs/wireframes")
    png_files = sorted(list(src_dir.glob("*.png")))
    
    print(f"Found {len(png_files)} PNG wireframe files in {src_dir}")
    
    # 1. Convert each PNG to JPG in docs/wireframes
    jpg_files = []
    for png_path in png_files:
        jpg_name = png_path.stem + ".jpg"
        jpg_path = src_dir / jpg_name
        
        with Image.open(png_path) as img:
            rgb_img = img.convert("RGB")
            rgb_img.save(jpg_path, "JPEG", quality=95)
        print(f"Generated JPG: {jpg_path}")
        jpg_files.append(jpg_path)
        
    # 2. Create Zip Archive in docs/wireframes
    zip_path = src_dir / "wireframes-motorent-cloud.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in png_files:
            zf.write(p, arcname=f"png/{p.name}")
        for j in jpg_files:
            zf.write(j, arcname=f"jpeg/{j.name}")
    print(f"Created ZIP: {zip_path}")
    
    # 3. Export to user's Windows Downloads directory
    downloads_dir = Path(r"C:\Users\Pongo\Downloads\MotoRent_Wireframes")
    downloads_dir.mkdir(parents=True, exist_ok=True)
    png_out = downloads_dir / "png"
    png_out.mkdir(parents=True, exist_ok=True)
    jpg_out = downloads_dir / "jpeg"
    jpg_out.mkdir(parents=True, exist_ok=True)
    
    for p in png_files:
        shutil.copy2(p, png_out / p.name)
        # Also copy directly in root of folder for instant drag-and-drop
        shutil.copy2(p, downloads_dir / p.name)
        
    for j in jpg_files:
        shutil.copy2(j, jpg_out / j.name)
        shutil.copy2(j, downloads_dir / j.name)
        
    user_zip = Path(r"C:\Users\Pongo\Downloads\MotoRent_Cloud_Wireframes_Tugas10.zip")
    shutil.copy2(zip_path, user_zip)
    print(f"Copied to Downloads folder: {downloads_dir}")
    print(f"Copied Zip to Downloads: {user_zip}")
    
    # 4. Copy to Antigravity Artifacts directory
    artifact_dir = Path(r"C:\Users\Pongo\.gemini\antigravity\brain\7c9a3ca8-3f0a-4733-8501-098b0b2a6cb4\wireframes")
    artifact_dir.mkdir(parents=True, exist_ok=True)
    for p in png_files:
        shutil.copy2(p, artifact_dir / p.name)
    for j in jpg_files:
        shutil.copy2(j, artifact_dir / j.name)
    print(f"Copied to Artifact directory: {artifact_dir}")

if __name__ == "__main__":
    main()
