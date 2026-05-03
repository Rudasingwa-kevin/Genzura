import { Jimp } from 'jimp';

async function removeBg(imagePath) {
    try {
        console.log(`Processing ${imagePath}...`);
        const image = await Jimp.read(imagePath);
        
        // Define tolerance (how close to white before making transparent)
        // Values from 0 to 255. High tolerance means strictly white.
        const tolerance = 240; 
        
        image.scan((x, y, idx) => {
            const r = image.bitmap.data[idx + 0];
            const g = image.bitmap.data[idx + 1];
            const b = image.bitmap.data[idx + 2];
            
            if (r >= tolerance && g >= tolerance && b >= tolerance) {
                // Set alpha to 0 (transparent)
                image.bitmap.data[idx + 3] = 0;
            }
        });
        
        await image.write(imagePath);
        console.log(`Successfully processed ${imagePath}`);
    } catch (err) {
        console.error(`Error processing ${imagePath}:`, err.message);
    }
}

async function main() {
    const files = [
        "public/Genzura Logo.png",
        "public/Genzura full logo.png",
        "public/Genzura website header.png"
    ];
    
    for (const f of files) {
        await removeBg(f);
    }
}

main();
