"use client"
import SignInForm from "@/components/auth/SignInForm";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const { user } = useAuthStore();
  const router = useRouter();
  if (user) {
    router.push("/");
    return null;
  }

  return <SignInForm />;
}
