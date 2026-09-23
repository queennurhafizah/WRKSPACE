import { api } from "./client";
import type { UploadResult } from "@/lib/types";
/** Upload lalu pastikan `filename` selalu terisi (fallback dari `url`). */

function toForm(file: File): FormData {
  const f = new FormData();
  f.append("file", file);
  return f;
}

async function upload(path: string, file: File): Promise<UploadResult> {
  const res = await api.postForm<any>(path, toForm(file));
  
  // Tangkap filename dari berbagai kemungkinan struktur response backend
  const filename =
    res?.filename ||
    res?.data?.filename ||
    res?.data?.foto ||
    res?.url?.split("/").pop() ||
    "";

  if (!filename) {
    throw new Error("Upload berhasil, tapi server tidak mengembalikan nama file.");
  }

  return { ...res, filename };
}

export const uploadApi = {
  image: (file: File) => upload("/api/upload/image", file),
  space: (file: File) => upload("/api/upload/spaces", file),
  member: (file: File) => upload("/api/upload/members", file),
};