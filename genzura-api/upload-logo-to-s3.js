import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const bucketName = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || 'us-east-1';

console.log('\n🎨 Uploading Genzura Logo to S3...\n');
console.log('Bucket:', bucketName);
console.log('Region:', region);
console.log('');

if (!accessKeyId || !secretAccessKey || !bucketName) {
  console.error('❌ Missing required S3 configuration in .env file');
  process.exit(1);
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function uploadLogo() {
  // Read logo file
  const logoPath = path.join(__dirname, 'public', 'Genzura full logo.png');

  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo file not found at:', logoPath);
    process.exit(1);
  }

  const logoBuffer = fs.readFileSync(logoPath);
  const fileSizeKB = (logoBuffer.length / 1024).toFixed(2);

  console.log(`📁 Found logo: ${fileSizeKB} KB`);
  console.log(`📂 Local path: ${logoPath}`);
  console.log('');

  // Upload to S3 in branding folder
  const s3Key = 'branding/genzura-logo.png';

  try {
    console.log('📤 Uploading to S3...');
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: logoBuffer,
      ContentType: 'image/png',
      // Make it publicly readable for email clients
      ACL: 'public-read',
    });

    await s3Client.send(uploadCommand);

    console.log('✅ Logo uploaded successfully!');
    console.log('');
    console.log('📍 S3 Location:', s3Key);
    console.log('');

    // Generate the public URL
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
    console.log('🌐 Public URL:');
    console.log('   ', publicUrl);
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Update your .env file with:');
    console.log(`      LOGO_URL="${publicUrl}"`);
    console.log('   2. Remove Cloudinary configuration');
    console.log('   3. Restart your API server');
    console.log('');

  } catch (error) {
    console.error('\n❌ Upload Error:', error.message);

    if (error.name === 'AccessDenied' || error.message.includes('ACL')) {
      console.error('\n⚠️  ACL Error: Your S3 bucket might have "Block all public access" enabled.');
      console.error('');
      console.error('Option 1 (Recommended): Use presigned URLs instead of public ACL');
      console.error('   - This is already implemented in your email service');
      console.error('   - The logo will be served via presigned URLs automatically');
      console.error('');
      console.error('Option 2: Enable public access in S3 bucket settings');
      console.error('   - Go to: https://console.aws.amazon.com/s3/');
      console.error(`   - Find bucket: ${bucketName}`);
      console.error('   - Permissions → Edit "Block public access" → Uncheck all');
      console.error('   - Add bucket policy to allow public read');
      console.error('');

      // Try upload without ACL
      console.log('🔄 Retrying without public ACL (will use presigned URLs)...');
      const retryCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: 'branding/genzura-logo.png',
        Body: logoBuffer,
        ContentType: 'image/png',
      });

      await s3Client.send(retryCommand);
      console.log('✅ Logo uploaded successfully (private, will use presigned URLs)!');
      console.log('');
      console.log('📍 S3 Location: branding/genzura-logo.png');
      console.log('');
      console.log('📝 Next Steps:');
      console.log('   1. Update emailService.ts to generate presigned URLs for the logo');
      console.log('   2. Remove Cloudinary configuration');
      console.log('');
    } else {
      console.error('\n   Full error:', error);
      process.exit(1);
    }
  }
}

uploadLogo();
