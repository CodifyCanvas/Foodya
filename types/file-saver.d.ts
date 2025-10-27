// file-saver.d.ts
declare module 'file-saver' {
  /**
   * Saves a Blob or File to the user's device
   * @param data - The Blob or File to save
   * @param filename - The name to save the file as
   */
  export function saveAs(data: Blob, filename: string): void;
}
