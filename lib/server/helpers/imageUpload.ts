"use server";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";



/**
 * === Uploads an image file to a specified folder within the public uploads directory. ===
 * 
 * @param {File} file - The image file to upload.
 * @param {string} folder - The folder name inside /public/uploads where the image should be stored.
 * 
 * @returns {Promise<string>} - The relative URL path to the uploaded image.
 * 
 * @throws {Error} - Throws if the provided file is invalid.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  
  // === Validate that the input is a File object ===
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file provided.");
  }

  // === Convert the File object to a Buffer for file system operations ===
  const buffer = Buffer.from(await file.arrayBuffer());

  // === Construct the directory path to upload the file ===
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  
  // === Ensure the directory exists; create it recursively if it doesn't ===
  await fs.mkdir(uploadDir, { recursive: true });

  // === Generate a sanitized, unique filename to avoid collisions ===
  const ext = path.extname(file.name);
  const baseName = path.basename(file.name, ext).replace(/\s+/g, "_");
  const filename = `${baseName}_${randomUUID()}${ext}`;

  // === Full absolute path to write the file ===
  const fullPath = path.join(uploadDir, filename);

  // === Write the file buffer to disk ===
  await fs.writeFile(fullPath, buffer);

  // === Return the relative path for use in the database ===
  return `/uploads/${folder}/${filename}`;
}