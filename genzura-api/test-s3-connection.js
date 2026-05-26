import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const bucketName = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || 'us-east-1';

console.log('\n🔍 Testing S3 Configuration...\n');
console.log('Bucket:', bucketName);
console.log('Region:', region);
console.log('Access Key ID:', accessKeyId ? `${accessKeyId.substring(0, 8)}...` : 'NOT SET');
console.log('Secret Key:', secretAccessKey ? '***configured***' : 'NOT SET');
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

async function testS3Connection() {
  try {
    // Test 1: List objects in bucket
    console.log('📋 Test 1: Listing objects in bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 10,
    });

    const listResponse = await s3Client.send(listCommand);
    console.log('✅ Successfully connected to S3 bucket!');
    console.log(`   Found ${listResponse.KeyCount || 0} objects`);

    if (listResponse.Contents && listResponse.Contents.length > 0) {
      console.log('   Recent files:');
      listResponse.Contents.slice(0, 5).forEach(obj => {
        console.log(`   - ${obj.Key} (${(obj.Size / 1024).toFixed(2)} KB)`);
      });
    } else {
      console.log('   Bucket is empty or no objects found');
    }

    // Test 2: Upload a test file
    console.log('\n📤 Test 2: Uploading test file...');
    const testContent = `S3 Connection Test\nDate: ${new Date().toISOString()}\nBucket: ${bucketName}`;
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: 'test/connection-test.txt',
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
    });

    await s3Client.send(uploadCommand);
    console.log('✅ Test file uploaded successfully!');
    console.log('   Location: test/connection-test.txt');

    console.log('\n✨ All tests passed! S3 is configured correctly.\n');

  } catch (error) {
    console.error('\n❌ S3 Connection Error:', error.message);

    if (error.name === 'NoSuchBucket') {
      console.error('   The bucket does not exist or you do not have access to it.');
    } else if (error.name === 'InvalidAccessKeyId') {
      console.error('   The AWS access key ID is invalid.');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('   The AWS secret access key is invalid.');
    } else if (error.name === 'AccessDenied') {
      console.error('   Access denied. Check your IAM permissions.');
    }

    console.error('\n   Full error:', error);
    process.exit(1);
  }
}

testS3Connection();
