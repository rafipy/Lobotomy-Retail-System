import { AdminLoginForm } from "@/app/components/form/admin-login-form";
import Image from "next/image";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-b from-black to-red-950 flex items-center justify-center">
      <Image
        src="/admin-login-image.png"
        alt="Background"
        fill
        className="object-cover animate-flicker"
        priority
        quality={90}
        style={{ opacity: 0 }}
      />
      <AdminLoginForm />
    </div>
  );
}
