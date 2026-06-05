import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import fs from 'fs';

const bucketName = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || 'us-east-1';

// Only initialize S3Client if the required credentials and bucket are present
let s3Client: S3Client | null = null;

if (accessKeyId && secretAccessKey && bucketName) {
  try {
    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  } catch (error) {
    console.error('[S3Service] Failed to initialize S3 client:', error);
  }
}

export class S3Service {
  /**
   * Check if AWS S3 integration is configured and active.
   */
  static isConfigured(): boolean {
    return s3Client !== null && !!bucketName;
  }

  /**
   * Uploads a file from local disk to S3, then deletes the local file.
   * @param localFilePath Path to the file on local disk
   * @param s3Key The destination key (path) inside the S3 bucket
   * @param mimeType The file's MIME type
   * @returns The S3 key on success
   */
  static async uploadFile(localFilePath: string, s3Key: string, mimeType: string): Promise<string> {
    if (!s3Client || !bucketName) {
      throw new Error('S3 integration is not configured.');
    }

    // Clean S3 Key by removing leading slash if present
    const cleanKey = s3Key.startsWith('/') ? s3Key.substring(1) : s3Key;

    try {
      const fileBuffer = fs.readFileSync(localFilePath);
      
      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: cleanKey,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await s3Client.send(uploadCommand);
      console.log(`[S3Service] Uploaded file to S3: ${cleanKey}`);
      
      // Clean up the local file after successful S3 upload
      try {
        fs.unlinkSync(localFilePath);
        console.log(`[S3Service] Cleaned up local file: ${localFilePath}`);
      } catch (err) {
        console.error(`[S3Service] Failed to delete local temp file at ${localFilePath}:`, err);
      }

      return cleanKey;
    } catch (error) {
      console.error(`[S3Service] Failed to upload file ${localFilePath} to S3:`, error);
      throw error;
    }
  }

  /**
   * Generates a temporary presigned URL for downloading a file from S3.
   * @param s3Key The object key in S3
   * @param expiresInSeconds URL expiration time (default 3600s / 1 hour)
   * @returns Presigned URL
   */
  static async getPresignedUrl(s3Key: string, expiresInSeconds: number = 3600): Promise<string> {
    if (!s3Client || !bucketName) {
      throw new Error('S3 integration is not configured.');
    }

    const cleanKey = s3Key.startsWith('/') ? s3Key.substring(1) : s3Key;

    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: cleanKey,
      });

      return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    } catch (error) {
      console.error(`[S3Service] Failed to generate presigned URL for key ${cleanKey}:`, error);
      throw error;
    }
  }

  /**
   * Streams an S3 object body directly (no redirect).
   * Use this for serving images/files through Express so the browser never
   * makes a cross-origin request to S3 (which triggers CORP blocking).
   * @param s3Key The object key in S3
   * @returns Object with a readable stream body and the ContentType string
   */
  static async streamObject(s3Key: string): Promise<{ body: Readable; contentType: string }> {
    if (!s3Client || !bucketName) {
      throw new Error('S3 integration is not configured.');
    }

    const cleanKey = s3Key.startsWith('/') ? s3Key.substring(1) : s3Key;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: cleanKey,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error(`S3 object body is empty for key: ${cleanKey}`);
    }

    return {
      body: response.Body as Readable,
      contentType: response.ContentType || 'application/octet-stream',
    };
  }

  /**
   * Deletes a file/object from S3.
   * @param s3Key The object key to delete
   */
  static async deleteFile(s3Key: string): Promise<void> {
    if (!s3Client || !bucketName) {
      return; // No-op if not configured
    }

    const cleanKey = s3Key.startsWith('/') ? s3Key.substring(1) : s3Key;

    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: cleanKey,
      });

      await s3Client.send(deleteCommand);
      console.log(`[S3Service] Deleted object from S3: ${cleanKey}`);
    } catch (error) {
      console.error(`[S3Service] Failed to delete key ${cleanKey} from S3:`, error);
    }
  }
}
