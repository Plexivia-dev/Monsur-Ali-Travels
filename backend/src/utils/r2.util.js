import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';

let s3ClientInstance = null;

// Checks if Cloudflare R2 credentials and bucket are configured
export const isR2Configured = () => {
  return Boolean(
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET_NAME
  );
};

// Initializes or gets the singleton S3 client for Cloudflare R2
export const getR2Client = () => {
  if (!isR2Configured()) {
    return null;
  }

  if (!s3ClientInstance) {
    const endpoint =
      env.R2_ENDPOINT ||
      `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return s3ClientInstance;
};

// Uploads a file Buffer directly to Cloudflare R2
export const uploadToR2 = async ({ fileBuffer, key, contentType = 'application/octet-stream', metadata = {} }) => {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured in environment variables.');
  }

  const cleanKey = key.replace(/^[/\\]+/, '');
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: cleanKey,
    Body: fileBuffer,
    ContentType: contentType,
    Metadata: metadata,
  });

  await client.send(command);

  return {
    key: cleanKey,
    bucket: env.R2_BUCKET_NAME,
    contentType,
    size: fileBuffer.length,
    publicUrl: env.R2_PUBLIC_DOMAIN ? `${env.R2_PUBLIC_DOMAIN.replace(/\/$/, '')}/${cleanKey}` : null,
  };
};

// Generates a Presigned PUT URL for direct client-side upload from frontend/dashboard
export const getPresignedUploadUrl = async ({ key, contentType = 'application/octet-stream', expiresIn = 300 }) => {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const cleanKey = key.replace(/^[/\\]+/, '');
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: cleanKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });

  return {
    uploadUrl,
    key: cleanKey,
    bucket: env.R2_BUCKET_NAME,
    expiresIn,
  };
};

// Generates a Presigned GET URL for temporary secure viewing/downloading of private ERP files
export const getPresignedViewUrl = async ({ key, expiresIn = 900 }) => {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const cleanKey = key.replace(/^[/\\]+/, '');
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: cleanKey,
  });

  const viewUrl = await getSignedUrl(client, command, { expiresIn });

  return {
    viewUrl,
    key: cleanKey,
    expiresIn,
  };
};

// Deletes an object from Cloudflare R2
export const deleteFromR2 = async ({ key }) => {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const cleanKey = key.replace(/^[/\\]+/, '');
  const command = new DeleteObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: cleanKey,
  });

  return await client.send(command);
};

// Lists all objects in Cloudflare R2 bucket (handles pagination)
export const listAllR2Objects = async ({ prefix = '', maxKeys = 1000 } = {}) => {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const allObjects = [];
  let isTruncated = true;
  let continuationToken = undefined;

  while (isTruncated) {
    const command = new ListObjectsV2Command({
      Bucket: env.R2_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    });

    const response = await client.send(command);

    if (response.Contents && response.Contents.length > 0) {
      for (const item of response.Contents) {
        if (item.Key) {
          allObjects.push({
            key: item.Key,
            size: item.Size || 0,
            lastModified: item.LastModified || new Date(),
          });
        }
      }
    }

    isTruncated = Boolean(response.IsTruncated);
    continuationToken = response.NextContinuationToken;
  }

  return allObjects;
};

// Deletes multiple objects from Cloudflare R2 in chunks of up to 1000
export const deleteMultipleFromR2 = async ({ keys }) => {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  if (!keys || keys.length === 0) {
    return { deletedCount: 0, errorCount: 0, errors: [] };
  }

  let deletedCount = 0;
  let errorCount = 0;
  const errors = [];

  const CHUNK_SIZE = 1000;
  for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
    const chunk = keys.slice(i, i + CHUNK_SIZE).map((k) => ({ Key: k.replace(/^[/\\]+/, '') }));

    try {
      const command = new DeleteObjectsCommand({
        Bucket: env.R2_BUCKET_NAME,
        Delete: {
          Objects: chunk,
          Quiet: false,
        },
      });

      const response = await client.send(command);

      if (response.Deleted) {
        deletedCount += response.Deleted.length;
      }
      if (response.Errors && response.Errors.length > 0) {
        errorCount += response.Errors.length;
        errors.push(...response.Errors);
      }
    } catch (chunkErr) {
      errorCount += chunk.length;
      errors.push({ message: chunkErr.message, keys: chunk });
    }
  }

  return {
    deletedCount,
    errorCount,
    errors,
  };
};

