import LoginForm from "@/app/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Se connecter</h1>
      <LoginForm />
      <p className="text-sm text-gray-600 mt-4">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="text-blue-600 hover:underline">
          S'inscrire
        </Link>
      </p>
    </div>
  );
}
