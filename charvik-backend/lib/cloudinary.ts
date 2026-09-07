import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Direct port of utils/cloudinary.js — already runtime-agnostic (buffer +
// stream based), no changes needed beyond TS types.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadImageFromBuffer(
  buffer: Buffer,
  folder = "properties/images"
): Promise<UploadResult> {
  try {
    const base64Data = buffer.toString("base64");
    const fileUri = `data:image/jpeg;base64,${base64Data}`;
    const result = await cloudinary.uploader.upload(fileUri, {
      folder,
      resource_type: "image",
      transformation: [{ width: 1200, height: 800, crop: "limit" }, { quality: "auto:good" }],
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error: any) {
    throw new Error(`Image upload failed: ${error?.message}`);
  }
}

export async function uploadVideoFromBuffer(
  buffer: Buffer,
  folder = "properties/videos"
): Promise<UploadResult> {
  try {
    const base64Data = buffer.toString("base64");
    const fileUri = `data:video/mp4;base64,${base64Data}`;
    const result = await cloudinary.uploader.upload(fileUri, {
      folder,
      resource_type: "video",
      transformation: [{ width: 1280, height: 720, crop: "limit" }, { quality: "auto" }],
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error: any) {
    throw new Error(`Video upload failed: ${error?.message}`);
  }
}

export async function deleteFile(publicId: string, resourceType: "image" | "video" = "image") {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    throw new Error(`File deletion failed: ${(error as Error).message}`);
  }
}

export async function deleteMultipleFiles(
  publicIds: string[],
  resourceType: "image" | "video" = "image"
) {
  try {
    const deletePromises = publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    );
    return await Promise.all(deletePromises);
  } catch (error) {
    throw new Error(`Multiple file deletion failed: ${(error as Error).message}`);
  }
}

export { cloudinary };
