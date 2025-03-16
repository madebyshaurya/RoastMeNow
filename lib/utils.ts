import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function encodeText(text: string): string {
  return encodeURIComponent(text).replace(/'/g, "%27").replace(/"/g, "%22");
}
