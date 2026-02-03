import { getUserLapTimes } from "@/app/actions/getUserLapTimes";
import { getUserStats, updateUserProfile } from "@/app/actions/getUserStats";
import { db } from "@/lib/db/drizzle";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { headers } from "next/headers";

interface ProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

  // Get current session to check if viewing own profile
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  const isOwnProfile = session?.user?.id === userId;

  // Récupérer les informations de l'utilisateur
  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    notFound();
  }

  // Récupérer les lap times de l'utilisateur
  const lapTimesData = await getUserLapTimes(userId);

  // Get stats
  await getUserStats(userId);
  const verifiedTimes = lapTimesData.filter((lt) => lt.status === "verified");
  const uniqueCircuits = new Set(lapTimesData.map((lt) => lt.track.id)).size;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête du profil */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              {userData.image && (
                <img
                  src={userData.image}
                  alt={userData.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {userData.name}
                </h1>
                <p className="text-gray-500 mt-1">{userData.email}</p>
                {userData.bio && (
                  <p className="text-gray-700 mt-3 text-sm max-w-xl">
                    {userData.bio}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-3">
                  Membre depuis {new Date(userData.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            {userData.isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Panneau admin
              </Link>
            )}
          </div>

          {/* Edit bio section if own profile */}
          {isOwnProfile && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <form action={updateUserProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    defaultValue={userData.bio || ""}
                    placeholder="Parlez un peu de vous..."
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {(userData.bio || "").length}/500
                  </p>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Mettre à jour
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Temps totaux</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {lapTimesData.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Temps validés</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {verifiedTimes.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Circuits visités</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {uniqueCircuits}
            </p>
          </div>
        </div>

        {/* Accès à l'historique détaillé */}
        {isOwnProfile && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Historique des temps
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Consultez l'ensemble de vos temps avec filtres et tri.
                </p>
              </div>
              <Link
                href="/history"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Voir l'historique
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
