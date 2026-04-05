import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { STORAGE_CONFIG } from '../../config/storage.config';

/**
 * Injectable service that wraps file-system operations for uploads.
 * Use this instead of raw `fs` calls in controllers / other services
 * so that storage logic can be swapped to S3/GCS later in one place.
 */
@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor() {
    // Ensure upload directories exist on startup
    this.ensureDirectory(STORAGE_CONFIG.audioDir);
    this.ensureDirectory(STORAGE_CONFIG.imageDir);
  }

  /** Create directory (and parents) if it doesn't exist yet. */
  private ensureDirectory(dir: string): void {
    const absDir = join(process.cwd(), dir);
    if (!existsSync(absDir)) {
      mkdirSync(absDir, { recursive: true });
      this.logger.log(`Created upload directory: ${absDir}`);
    }
  }

  /** Safely delete a file at the given relative path (e.g. `uploads/audio/xyz.mp3`). */
  async deleteFile(relativePath: string): Promise<void> {
    try {
      const absPath = join(process.cwd(), relativePath);
      await unlink(absPath);
      this.logger.debug(`Deleted file: ${absPath}`);
    } catch (err) {
      // File may already be gone – log but don't throw.
      this.logger.warn(
        `Could not delete file at ${relativePath}: ${(err as Error).message}`,
      );
    }
  }

  /** Return the configured max audio file size. */
  getMaxAudioSize(): number {
    return STORAGE_CONFIG.maxAudioFileSize;
  }

  /** Return the configured max image file size. */
  getMaxImageSize(): number {
    return STORAGE_CONFIG.maxImageFileSize;
  }
}
