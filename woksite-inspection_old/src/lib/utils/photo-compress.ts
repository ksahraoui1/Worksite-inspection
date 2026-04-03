const MAX_WIDTH = 1920;
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const QUALITY_HIGH = 0.85;
const QUALITY_LOW = 0.5;

export async function compressPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  // Calculer les dimensions redimensionnées
  let newWidth = width;
  let newHeight = height;
  if (width > MAX_WIDTH) {
    const ratio = MAX_WIDTH / width;
    newWidth = MAX_WIDTH;
    newHeight = Math.round(height * ratio);
  }

  // Utiliser OffscreenCanvas si disponible, sinon HTMLCanvasElement
  let canvas: OffscreenCanvas | HTMLCanvasElement;
  let ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;

  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(newWidth, newHeight);
    ctx = canvas.getContext("2d");
  } else {
    canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx = canvas.getContext("2d");
  }

  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
  bitmap.close();

  // Essayer avec qualité haute d'abord
  let blob = await canvasToBlob(canvas, QUALITY_HIGH);
  if (blob.size > MAX_SIZE_BYTES) {
    blob = await canvasToBlob(canvas, QUALITY_LOW);
  }

  return blob;
}

async function canvasToBlob(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: "image/jpeg", quality });
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      quality
    );
  });
}
