import { Jimp } from 'jimp';
import fs from 'fs';

const files = [
    "public/Genzura Logo.png",
    "public/Genzura full logo.png",
    "public/Genzura website header.png"
];

const tolerance = 240;

async function processImages() {
    for (const file of files) {
        try {
            if (!fs.existsSync(file)) {
                console.log(`File not found, skipping: ${file}`);
                continue;
            }
            
            const image = await Jimp.read(file);
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
                const red   = this.bitmap.data[idx + 0];
                const green = this.bitmap.data[idx + 1];
                const blue  = this.bitmap.data[idx + 2];
                
                if (red >= tolerance && green >= tolerance && blue >= tolerance) {
                    this.bitmap.data[idx + 3] = 0; // set alpha to 0 (transparent)
                }
            });
            
            await image.write(file);
            console.log(`Successfully processed ${file}`);
        } catch (e) {
            console.log(`Failed to process ${file}:`, e.message);
        }
    }
}

processImages();
