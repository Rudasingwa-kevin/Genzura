const Jimp = require('jimp');
const fs = require('fs');

const files = [
    "public/Genzura Logo.png",
    "public/Genzura full logo.png",
    "public/Genzura website header.png"
];

const tolerance = 240;

async function processImages() {
    // Determine the export based on jimp version
    const JimpClass = Jimp.Jimp || Jimp.default || Jimp;
    
    for (const file of files) {
        try {
            if (!fs.existsSync(file)) {
                console.log(`File not found, skipping: ${file}`);
                continue;
            }
            
            const image = await JimpClass.read(file);
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
                const red   = this.bitmap.data[idx + 0];
                const green = this.bitmap.data[idx + 1];
                const blue  = this.bitmap.data[idx + 2];
                
                if (red >= tolerance && green >= tolerance && blue >= tolerance) {
                    this.bitmap.data[idx + 3] = 0; // set alpha to 0 (transparent)
                }
            });
            
            // Depending on Jimp version, writeAsync might not exist. write uses a callback but also returns a promise in newer versions. 
            // In v0.x, image.write(file) returns this. Let's wrap in a promise just in case.
            await new Promise((resolve, reject) => {
                image.write(file, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            console.log(`Successfully processed ${file}`);
        } catch (e) {
            console.log(`Failed to process ${file}:`, e.message);
        }
    }
}

processImages();
