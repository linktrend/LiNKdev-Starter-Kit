export const noop = () => {};
export const cn = (...parts: Array<string | false | null | undefined | Record<string, boolean>>) =>
  parts
    .filter(Boolean)
    .map(part => {
      if (typeof part === 'object' && part !== null) {
        return Object.entries(part)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(' ');
      }
      return part;
    })
    .filter(Boolean)
    .join(' ');

export function convertBlobUrlToFile(blobUrl: string, filename: string): Promise<File> {
  return fetch(blobUrl)
    .then(res => res.blob())
    .then(blob => new File([blob], filename, { type: blob.type }));
}
