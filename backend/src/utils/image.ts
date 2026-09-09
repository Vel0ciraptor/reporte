import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

export async function convertToWebp(filename: string): Promise<string> {
  const ext = path.extname(filename).toLowerCase();
  const baseName = path.basename(filename, ext);

  if (!['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'].includes(ext)) {
    return filename;
  }

  const inputPath = path.join(UPLOADS_DIR, filename);
  const outputFilename = `${baseName}.webp`;
  const outputPath = path.join(UPLOADS_DIR, outputFilename);

  try {
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);

    fs.unlinkSync(inputPath);

    return outputFilename;
  } catch (error) {
    console.error('Error convirtiendo a WebP:', error);
    return filename;
  }
}

export function deleteFile(filename: string | null): void {
  if (!filename) return;
  const filePath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
