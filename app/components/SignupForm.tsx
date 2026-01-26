"use client";

import { useState } from "react";
import { signup } from "@/app/actions/signup";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email || !password) {
      setError("Tous les champs sont requis");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);
    try {
      const result = await signup({ firstName, lastName, email, password });

      if (result.success) {
        router.push("/lap-times");
      } else {
        setError(result.error || "Une erreur est survenue");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-2">Prénom</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jean"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nom</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Dupont"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jean@example.com"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {loading ? "Création en cours..." : "Créer un compte"}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-4">
        Vous avez déjà un compte ?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}
