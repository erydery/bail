import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import type { Request } from 'express';

// ── Configuration Cloudinary ───────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Multer : stockage en mémoire (on upload directement le buffer) ─────────
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max par fichier
  fileFilter(_req: Request, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées'));
    }
  },
});

// ── Upload un buffer vers Cloudinary ─────────────────────────────────────
export function uploadBuffer(
  buffer: Buffer,
  folder = 'gestion-locative/logements',
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload échoué'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

// ── Supprime une image Cloudinary par son publicId ────────────────────────
export function deleteImage(publicId: string): Promise<void> {
  return cloudinary.uploader.destroy(publicId).then(() => undefined);
}
