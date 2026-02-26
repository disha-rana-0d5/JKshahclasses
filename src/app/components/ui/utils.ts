import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getVideoThumbnail(url: string): string {
  if (!url) return "";

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
  }

  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    // For Vimeo, we'd ideally need an API call, but we can use a placeholder for now 
    // or assume the user will provide a thumbnail if Vimeo is critical.
    // However, there is a simple thumb service for Vimeo:
    return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
  }

  return "";
}
