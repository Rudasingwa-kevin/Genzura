import os
from PIL import Image

def process():
    try:
        from rembg import remove
    except ImportError:
        print("rembg is not installed. Please wait for pip install to finish.")
        return

    files_to_process = [
        "public/Genzura Logo.png",
        "public/Genzura full logo.png",
        "public/Genzura website header.png"
    ]

    for file_path in files_to_process:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            continue
            
        print(f"Processing {file_path}...")
        try:
            input_image = Image.open(file_path)
            output_image = remove(input_image)
            output_image.save(file_path)
            print(f"Successfully processed and saved {file_path}")
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    process()
