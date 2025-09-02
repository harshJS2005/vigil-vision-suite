// Lightweight perceptual hashing (aHash) utilities for image similarity

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function aHashFromImageData(img: HTMLImageElement, size = 8): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const gray: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    gray.push(0.299 * r + 0.587 * g + 0.114 * b);
  }
  const avg = gray.reduce((a, b) => a + b, 0) / gray.length;
  return gray.map((v) => (v >= avg ? '1' : '0')).join('');
}

export function hammingDistance(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  let dist = 0;
  for (let i = 0; i < len; i++) if (a[i] !== b[i]) dist++;
  return dist + Math.abs(a.length - b.length);
}

export async function computeAHash(src: string): Promise<string> {
  const img = await loadImage(src);
  return aHashFromImageData(img);
}
