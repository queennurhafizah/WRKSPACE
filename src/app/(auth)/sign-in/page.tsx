import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = { title: "Masuk" };

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <SignInForm />
    </Suspense>
  );
}
