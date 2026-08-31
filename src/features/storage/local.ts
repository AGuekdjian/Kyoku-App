import path from "node:path";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import type { StorageProvider } from "./provider";
function root() {
  return path.join(process.cwd(), ".data", "uploads");
}
function safe(key: string) {
  const value = path.resolve(root(), key);
  if (!value.startsWith(`${root()}${path.sep}`))
    throw new Error("INVALID_STORAGE_KEY");
  return value;
}
export class LocalStorage implements StorageProvider {
  async upload({ key, data }: { key: string; data: Uint8Array }) {
    const file = safe(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, data);
  }
  async delete(key: string) {
    try {
      await unlink(safe(key));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  async getUrl(key: string) {
    return `/api/documents/file?key=${encodeURIComponent(key)}`;
  }
}
