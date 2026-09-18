import { Storage } from "@google-cloud/storage";
import { env } from "../config/env.js";

let storageInstance = null;

export const DEFAULT_GCS_BUCKET = "mat-document-storage-9213af41";

/**
 * Checks if Google Cloud Storage is configured
 */
export const isGCSConfigured = () => {
  return Boolean(env.GCS_BUCKET_NAME || DEFAULT_GCS_BUCKET);
};

/**
 * Singleton Google Cloud Storage client instance
 */
export const getGCSStorage = () => {
  if (!storageInstance) {
    const options = {};
    if (env.GCS_PROJECT_ID) {
      options.projectId = env.GCS_PROJECT_ID;
    }
    if (env.GOOGLE_APPLICATION_CREDENTIALS) {
      options.keyFilename = env.GOOGLE_APPLICATION_CREDENTIALS;
    }
    storageInstance = new Storage(options);
  }
  return storageInstance;
};

/**
 * Get configured GCS Bucket instance
 */
export const getGCSBucket = () => {
  const storage = getGCSStorage();
  const bucketName = env.GCS_BUCKET_NAME || DEFAULT_GCS_BUCKET;
  return storage.bucket(bucketName);
};

/**
 * Upload Buffer directly to Google Cloud Storage
 */
export const uploadToGCS = async ({
  fileBuffer,
  key,
  contentType = "application/octet-stream",
  metadata = {},
}) => {
  const bucket = getGCSBucket();
  const cleanKey = key.replace(/^[/\\]+/, "");
  const file = bucket.file(cleanKey);

  await file.save(fileBuffer, {
    contentType,
    metadata: {
      metadata,
    },
    resumable: false,
  });

  return {
    key: cleanKey,
    bucket: bucket.name,
    contentType,
    size: fileBuffer.length,
    publicUrl: `https://storage.googleapis.com/${bucket.name}/${cleanKey}`,
  };
};

/**
 * Generate Presigned V4 Upload URL for direct client-side upload to GCS
 */
export const getPresignedUploadUrl = async ({
  key,
  contentType = "application/octet-stream",
  expiresIn = 300,
}) => {
  const bucket = getGCSBucket();
  const cleanKey = key.replace(/^[/\\]+/, "");
  const file = bucket.file(cleanKey);

  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + expiresIn * 1000,
    contentType,
  });

  return {
    uploadUrl,
    key: cleanKey,
    bucket: bucket.name,
    expiresIn,
  };
};

/**
 * Generate Presigned V4 View URL for temporary secure document access
 */
export const getPresignedViewUrl = async ({ key, expiresIn = 900 }) => {
  const bucket = getGCSBucket();
  const cleanKey = key.replace(/^[/\\]+/, "");
  const file = bucket.file(cleanKey);

  const [viewUrl] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + expiresIn * 1000,
  });

  return {
    viewUrl,
    key: cleanKey,
    expiresIn,
  };
};

/**
 * Delete a single object from Google Cloud Storage
 */
export const deleteFromGCS = async ({ key }) => {
  const bucket = getGCSBucket();
  const cleanKey = key.replace(/^[/\\]+/, "");
  const file = bucket.file(cleanKey);

  try {
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
    }
    return { success: true, key: cleanKey };
  } catch (err) {
    console.error(`Error deleting ${cleanKey} from GCS:`, err.message);
    throw err;
  }
};

/**
 * Delete multiple objects from Google Cloud Storage
 */
export const deleteMultipleFromGCS = async ({ keys }) => {
  const bucket = getGCSBucket();
  if (!keys || keys.length === 0) {
    return { deletedCount: 0, errorCount: 0, errors: [] };
  }

  let deletedCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const k of keys) {
    try {
      const cleanKey = k.replace(/^[/\\]+/, "");
      const file = bucket.file(cleanKey);
      const [exists] = await file.exists();
      if (exists) {
        await file.delete();
        deletedCount++;
      }
    } catch (err) {
      errorCount++;
      errors.push({ key: k, error: err.message });
    }
  }

  return {
    deletedCount,
    errorCount,
    errors,
  };
};

/**
 * List all objects with prefix in Google Cloud Storage bucket
 */
export const listAllGCSObjects = async ({ prefix = "" } = {}) => {
  const bucket = getGCSBucket();
  const [files] = await bucket.getFiles({ prefix });

  return files.map((file) => ({
    key: file.name,
    size: Number(file.metadata?.size || 0),
    lastModified: file.metadata?.updated ? new Date(file.metadata.updated) : new Date(),
  }));
};
