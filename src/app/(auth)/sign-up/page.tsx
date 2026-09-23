import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = { title: "Daftar" };

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <SignUpForm />
    </Suspense>
  );
}
