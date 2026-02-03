"use client";

import { signOut, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await signOut();
    router.push("/");
    setLoading(false);
  };

  if (session?.user) {
    return (
      <div className="flex items-center space-x-4">
        <Link 
          href={`/profile/${session.user.id}`}
          className="text-sm text-gray-700 hover:text-blue-600 hover:underline"
        >
          {session.user.name}
        </Link>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Déconnexion..." : "Déconnecter"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link
        href="/login"
        className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium border border-gray-300 rounded-md"
      >
        Connexion
      </Link>
      <Link
        href="/signup"
        className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 text-sm font-medium rounded-md"
      >
        S'inscrire
      </Link>
    </div>
  );
}
