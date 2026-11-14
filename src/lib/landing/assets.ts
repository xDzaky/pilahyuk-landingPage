import { existsSync } from "node:fs";
import path from "node:path";
import { imageSlots, screenSlots, type ImageSlotName } from "@/content/id";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function publicUrl(relativePath: string): string | null {
  return existsSync(path.join(PUBLIC_DIR, relativePath)) ? `/${relativePath}` : null;
}

/** Kembalikan URL gambar bila berkasnya sudah ada di public/img, selain itu null. */
export function imageSrc(slot: ImageSlotName): string | null {
  return publicUrl(imageSlots[slot].file);
}

/** Kembalikan URL screenshot bila berkasnya sudah ada di public/screens. */
export function screenSrc(screen: string): string | null {
  const entry = screenSlots[screen];
  if (!entry) return null;
  return publicUrl(entry.file);
}
