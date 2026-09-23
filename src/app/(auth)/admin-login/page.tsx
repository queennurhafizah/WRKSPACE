import { Suspense } from "react";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export const metadata = { title: "Login Admin" };

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
