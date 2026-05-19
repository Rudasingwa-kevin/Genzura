/**
 * Upload Genzura logo to Cloudinary
 *
 * Before running:
 * 1. Sign up at https://cloudinary.com (free tier)
 * 2. Get your credentials from dashboard
 * 3. Set environment variables in .env:
 *    CLOUDINARY_CLOUD_NAME=your-cloud-name
 *    CLOUDINARY_API_KEY=your-api-key
 *    CLOUDINARY_API_SECRET=your-api-secret
 * 4. Run: node upload-logo-to-cloudinary.js
 */

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadLogo() {
  try {
    console.log('\n🚀 Uploading Genzura logo to Cloudinary...\n');

    // Check if credentials are set
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Error: Cloudinary credentials not found in .env file');
      console.log('\n📝 Add these to your .env file:');
      console.log('   CLOUDINARY_CLOUD_NAME=your-cloud-name');
      console.log('   CLOUDINARY_API_KEY=your-api-key');
      console.log('   CLOUDINARY_API_SECRET=your-api-secret');
      console.log('\n💡 Get credentials from: https://cloudinary.com/console\n');
      process.exit(1);
    }

    const logoPath = join(__dirname, 'public', 'Genzura full logo.png');

    // Upload with optimization
    const result = await cloudinary.uploader.upload(logoPath, {
      folder: 'genzura',
      public_id: 'genzura-logo',
      overwrite: true,
      resource_type: 'image',
      // Optimization settings
      quality: 'auto',
      fetch_format: 'auto',
      // Transformations
      transformation: [
        { width: 500, crop: 'limit' }, // Max width 500px for emails
        { quality: 'auto:good' }, // Smart compression
        { fetch_format: 'auto' } // Auto format (WebP for modern browsers, PNG fallback)
      ]
    });

    console.log('✅ Logo uploaded successfully!\n');
    console.log('📸 Image Details:');
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   Format: ${result.format}`);
    console.log(`   Size: ${(result.bytes / 1024).toFixed(2)} KB`);
    console.log(`   Width: ${result.width}px`);
    console.log(`   Height: ${result.height}px`);
    console.log(`\n🔗 Cloudinary URL:\n   ${result.secure_url}\n`);

    console.log('📋 Add this to your .env file:');
    console.log(`   LOGO_URL=${result.secure_url}`);
    console.log('');

    // Also create a smaller version for mobile
    const mobileResult = await cloudinary.uploader.upload(logoPath, {
      folder: 'genzura',
      public_id: 'genzura-logo-mobile',
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 250, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    console.log('✅ Mobile version uploaded!\n');
    console.log(`   Size: ${(mobileResult.bytes / 1024).toFixed(2)} KB`);
    console.log(`   URL: ${mobileResult.secure_url}\n`);

    console.log('🎉 Upload complete! Your logo is now hosted on Cloudinary CDN.\n');
    console.log('📧 Emails will now use the CDN-hosted logo for better deliverability.\n');

  } catch (error) {
    console.error('❌ Upload failed:', error.message);

    if (error.message.includes('ENOENT')) {
      console.log('\n💡 Make sure the logo exists at: public/Genzura full logo.png');
    } else if (error.message.includes('401')) {
      console.log('\n💡 Check your Cloudinary credentials in .env file');
    }

    process.exit(1);
  }
}

// Run upload
uploadLogo();
