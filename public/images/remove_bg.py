import os
from PIL import Image
from rembg import remove

def process_nextjs_images(input_folder, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    valid_extensions = ('.png', '.jpg', '.jpeg', '.webp')
    
    all_files = os.listdir(input_folder)
    image_files = [f for f in all_files if f.lower().endswith(valid_extensions)]
    
    print(f"🚀 Found {len(image_files)} assets in '{input_folder}'.")
    print(f"🛡️ Original files are safe. Outputting clean images to '{output_folder}'.\n")

    for index, file_name in enumerate(image_files, start=1):
        input_path = os.path.join(input_folder, file_name)
        
        # Next.js works great with WebP or PNG. Let's output PNG to safely hold transparency.
        base_name = os.path.splitext(file_name)[0]
        output_path = os.path.join(output_folder, f"{base_name}.png")
        
        print(f"[{index}/{len(image_files)}] Checking '{file_name}'...")
        
        try:
            with Image.open(input_path) as img:
                # Skip if already transparent
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    extrema = img.getextrema()
                    # Check the alpha channel (index 3 for RGBA)
                    if (img.mode == 'RGBA' and extrema[3][0] < 255) or (img.mode == 'LA' and extrema[0][0] < 255):
                        print(f"   ⏩ SKIPPED: '{file_name}' already has transparency.")
                        continue
                
                print(f"   ✂️ Extracting foreground...")
                if img.mode not in ('RGB', 'RGBA'):
                    img = img.convert('RGB')
                
                output_img = remove(img)
                output_img.save(output_path, 'PNG')
                print(f"   ✅ SAVED: '{os.path.basename(output_path)}'")
                
        except Exception as e:
            print(f"   ❌ ERROR on '{file_name}': {e}")

if __name__ == "__main__":
    # Point directly to your Next.js product image structure
    INPUT_DIR = "./products"
    OUTPUT_DIR = "./products_clean"
    
    process_nextjs_images(INPUT_DIR, OUTPUT_DIR)
