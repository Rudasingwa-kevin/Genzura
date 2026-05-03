from PIL import Image

def remove_white_bg(img_path, tolerance=240):
    try:
        img = Image.open(img_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # item is (R, G, B, A)
            if item[0] >= tolerance and item[1] >= tolerance and item[2] >= tolerance:
                # White pixel -> make transparent
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(img_path, "PNG")
        print(f"Successfully processed {img_path}")
    except Exception as e:
        print(f"Failed to process {img_path}: {e}")

if __name__ == '__main__':
    files = [
        "public/Genzura Logo.png",
        "public/Genzura full logo.png",
        "public/Genzura website header.png"
    ]
    for f in files:
        remove_white_bg(f)
