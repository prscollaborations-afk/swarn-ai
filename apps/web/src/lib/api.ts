export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) return cleanPath;
  return `${API_BASE_URL.replace(/\/$/, "")}${cleanPath}`;
}
