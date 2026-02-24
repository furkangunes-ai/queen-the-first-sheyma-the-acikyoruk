import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

const isR2Configured = !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);

if (!isR2Configured) {
  console.warn(
    "⚠️ R2 environment variables are not fully configured. File uploads will not work.",
    "Missing:", [
      !R2_ACCOUNT_ID && "R2_ACCOUNT_ID",
      !R2_ACCESS_KEY_ID && "R2_ACCESS_KEY_ID",
      !R2_SECRET_ACCESS_KEY && "R2_SECRET_ACCESS_KEY",
    ].filter(Boolean).join(", ")
  );
}

export const r2: S3Client | null = isR2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

export async function getUploadUrl(key: string, contentType: string) {
  if (!r2) {
    throw new Error("R2 storage is not configured. Please set R2 environment variables.");
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(r2, command, { expiresIn: 900 }); // 15 dakika
  return url;
}

export async function deleteFile(key: string) {
  if (!r2) {
    throw new Error("R2 storage is not configured. Please set R2 environment variables.");
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });

  await r2.send(command);
}

export function getPublicUrl(key: string) {
  return `${R2_PUBLIC_URL}/${key}`;
}
