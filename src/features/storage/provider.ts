export interface StorageProvider {
  upload(input: { key: string; data: Uint8Array }): Promise<void>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
}
