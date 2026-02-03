import { getUserLapTimes } from "@/app/actions/getUserLapTimes";
import { db } from "@/lib/db/drizzle";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

interface ProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

function formatLapTime(timeMs: number): string {
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);
  const milliseconds = timeMs % 1000;
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête du profil */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            {userData.image && (
              <img
                src={userData.image}
                alt={userData.name}
                className="w-20 h-20 rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {userData.name}
              </h1>
              <p className="text-gray-500">{userData.email}</p>
              <p className="text-sm text-gray-400 mt-1">
                Membre depuis {new Date(userData.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total des temps</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {lapTimesData.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Temps validés</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {lapTimesData.filter(lt => lt.status === 'verified').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Circuits visités</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {new Set(lapTimesData.map(lt => lt.track.id)).size}
            </p>
          </div>
        </div>

        {/* Liste des lap times */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Temps enregistrés
            </h2>
          </div>
          {lapTimesData.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Aucun temps enregistré pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Circuit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Configuration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Voiture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Temps
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lapTimesData.map((lapTime) => (
                    <tr key={lapTime.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/tracks/${lapTime.track.slug}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {lapTime.track.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lapTime.trackLayout.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lapTime.carModel.make} {lapTime.carModel.model}
                        {lapTime.carModel.trim && ` ${lapTime.carModel.trim}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatLapTime(lapTime.timeMs)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lapTime.drivenAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            lapTime.status === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : lapTime.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {lapTime.status === 'verified'
                            ? 'Validé'
                            : lapTime.status === 'pending'
                            ? 'En attente'
                            : 'Rejeté'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
