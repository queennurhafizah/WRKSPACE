import { api } from "./client";
import type {
  AuthUser,
  LoginDto,
  RegisterMemberDto,
  SessionUser,
} from "@/lib/types";

export const authApi = {
  /** Registrasi member baru (publik) dengan upload multipart/form-data. */
  registerMember: (dto: RegisterMemberDto) => {
    const formData = new FormData();
    formData.append("username", dto.username);
    formData.append("password", dto.password);
    formData.append("nama_member", dto.nama_member);
    formData.append("instansi", dto.instansi);
    formData.append("alamat", dto.alamat);
    formData.append("telp", dto.telp);

    if (dto.foto) {
      formData.append("foto", dto.foto);
    }

    // Pakai api.postForm agar terdeteksi sebagai FormData oleh client.ts
    return api.postForm<AuthUser>("/api/auth/register/member", formData, {
      token: null,
    });
  },

  /** Login member atau admin_space. Mengembalikan user + access_token. */
  login: (dto: LoginDto) =>
    api.post<AuthUser>("/api/auth/login", dto, { token: null }),

  /** Profil pengguna yang sedang login (butuh Bearer token). */
  profile: (token?: string) =>
    api.get<SessionUser>("/api/auth/profile", { token }),
};