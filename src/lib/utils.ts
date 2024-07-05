import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Copies the value to the clipboard
 *
 * @param value - the value to copy
 */
export function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value);
}
