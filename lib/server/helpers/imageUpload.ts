"use server";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function uploadImage(file: File, folder: string): Promise<string> {
  // ✅ Ensure file is a valid File instance
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file provided.");
  }

  // ✅ Convert File to Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // ✅ Ensure upload directory exists
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  // ✅ Sanitize and generate a unique filename
  const ext = path.extname(file.name);
  const baseName = path.basename(file.name, ext).replace(/\s+/g, "_");
  const filename = `${baseName}_${randomUUID()}${ext}`;

  // ✅ Full path where file will be stored
  const fullPath = path.join(uploadDir, filename);

  // ✅ Write file to disk
  await fs.writeFile(fullPath, buffer);

  // ✅ Return relative path (for frontend or DB)
  return `/uploads/${folder}/${filename}`;
}