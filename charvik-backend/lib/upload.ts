import { HttpError } from "./errorResponse";

// Re-implements middleware/upload.js's multer config (15 images / 2 videos /
// 50MB / per-field mimetype checks) manually, since multer doesn't run in
// Next.js route handlers — callers use `request.formData()` and pass the
// resulting FormData here.

export interface ParsedFile {
  buffer: Buffer;
  mimetype: string;
  filename: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB, matches middleware/upload.js

const FIELD_MIME_CHECK: Record<string, (mime: string) => boolean> = {
  images: (m) => m.startsWith("image/"),
  video: (m) => m.startsWith("video/"),
  videos: (m) => m.startsWith("video/"),
  featuredLocationImage: (m) => m.startsWith("image/"),
  curatedPropertyImage: (m) => m.startsWith("image/"),
  categoryImage: (m) => m.startsWith("image/"),
};

export async function extractFiles(formData: FormData, field: string): Promise<ParsedFile[]> {
  const entries = formData
    .getAll(field)
    .filter((v): v is File => typeof File !== "undefined" && v instanceof File && v.size > 0);

  const check = FIELD_MIME_CHECK[field];
  const results: ParsedFile[] = [];

  for (const file of entries) {
    if (file.size > MAX_FILE_SIZE) {
      throw new HttpError(400, `File "${file.name}" exceeds the 50MB size limit`);
    }
    if (check && !check(file.type)) {
      throw new HttpError(400, `Invalid file type for field "${field}": ${file.type}`);
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    results.push({ buffer, mimetype: file.type, filename: file.name });
  }

  return results;
}

export async function extractSingleFile(
  formData: FormData,
  field: string
): Promise<ParsedFile | null> {
  const files = await extractFiles(formData, field);
  return files[0] ?? null;
}
