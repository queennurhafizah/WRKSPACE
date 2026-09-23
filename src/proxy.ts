import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_KEY, ROLE_KEY } from "@/lib/auth-storage";

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(TOKEN_KEY)?.value;
  const role  = req.cookies.get(ROLE_KEY)?.value;

  const isMemberArea = pathname.startsWith("/reservasi") || pathname.startsWith("/akun");
  const isAdminArea  = pathname.startsWith("/admin") && pathname !== "/admin-login";
  const isAuthPage   = ["/sign-in", "/sign-up", "/admin-login"].includes(pathname);

  // Sudah login → jangan masuk halaman auth lagi
  if (isAuthPage && token) {
    const dest = role === "admin_space" ? "/admin" : "/akun";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Area member — wajib login sebagai member
  if (isMemberArea) {
    if (!token) {
      const url = new URL("/sign-in", req.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    if (role !== "member") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Area admin — wajib login sebagai admin_space
  if (isAdminArea) {
    if (!token) {
      const url = new URL("/admin-login", req.url);
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
    if (role !== "admin_space") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/reservasi/:path*",
    "/akun/:path*",
    "/admin",
    "/admin/:path*",
    "/sign-in",
    "/sign-up",
    "/admin-login",
  ],
};