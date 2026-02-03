import { getTrackBySlug } from "@/app/actions/getTrackBySlug";
import { getTrackLayoutsByTrack } from "@/app/actions/getTrackLayouts";
import { getTrackLeaderboard } from "@/app/actions/getTrackLeaderboard";
import { notFound } from "next/navigation";
import Link from "next/link";

interface TrackDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatLapTime(timeMs: number): string {
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);
  const milliseconds = timeMs % 1000;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds
    .toString()
    .padStart(3, "0")}`;
}

export default async function TrackDetailPage({ params }: TrackDetailPageProps) {
  const { slug } = await params;
  const result = await getTrackBySlug(slug);

  if (!result.success || !result.track) {
    notFound();
  }

  const track = result.track;
  const layoutsResult = await getTrackLayoutsByTrack(track.id);
  const leaderboardResult = await getTrackLeaderboard(track.id);
  const layouts = layoutsResult.success ? layoutsResult.layouts : [];
  const leaderboard = leaderboardResult.success ? leaderboardResult.lapTimes || [] : [];

  const lapTimesByLayout = new Map<string, typeof leaderboard>();
  leaderboard.forEach((lapTime) => {
    const list = lapTimesByLayout.get(lapTime.trackLayout.id) || [];
    list.push(lapTime);
    lapTimesByLayout.set(lapTime.trackLayout.id, list);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/tracks" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Retour aux circuits
      </Link>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold mb-6">{track.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Localisation */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Localisation</h2>
            <div className="space-y-2">
              {track.country && (
                <p><span className="font-medium">Pays:</span> {track.country}</p>
              )}
              {track.region && (
                <p><span className="font-medium">Région:</span> {track.region}</p>
              )}
              {track.city && (
                <p><span className="font-medium">Ville:</span> {track.city}</p>
              )}
            </div>
          </div>

          {/* Caractéristiques */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Caractéristiques</h2>
            <div className="space-y-2">
              {track.lengthKm && (
                <p><span className="font-medium">Longueur:</span> {track.lengthKm} km</p>
              )}
              {track.turnCount && (
                <p><span className="font-medium">Nombre de virages:</span> {track.turnCount}</p>
              )}
              {track.direction && (
                <p><span className="font-medium">Direction:</span> {track.direction}</p>
              )}
              {track.surfaceType && (
                <p><span className="font-medium">Surface:</span> {track.surfaceType}</p>
              )}
              {track.trackType && (
                <p><span className="font-medium">Type:</span> {track.trackType}</p>
              )}
            </div>
          </div>

          {/* Altitude */}
          {(track.altitudeMinM || track.altitudeMaxM) && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-700">Altitude</h2>
              <div className="space-y-2">
                {track.altitudeMinM && (
                  <p><span className="font-medium">Altitude min:</span> {track.altitudeMinM} m</p>
                )}
                {track.altitudeMaxM && (
                  <p><span className="font-medium">Altitude max:</span> {track.altitudeMaxM} m</p>
                )}
              </div>
            </div>
          )}

          {/* Informations diverses */}
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-700">Informations</h2>
            <div className="space-y-2">
              {track.openedAt && (
                <p><span className="font-medium">Ouverture:</span> {new Date(track.openedAt).toLocaleDateString('fr-FR')}</p>
              )}
              {track.websiteUrl && (
                <p>
                  <span className="font-medium">Site web:</span>{" "}
                  <a href={track.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Visiter
                  </a>
                </p>
              )}
              <p>
                <span className="font-medium">Statut:</span>{" "}
                <span className={track.isActive ? "text-green-600" : "text-red-600"}>
                  {track.isActive ? "Actif" : "Inactif"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Photo de couverture */}
        {track.photoCoverUrl && (
          <div className="mt-8">
            <img
              src={track.photoCoverUrl}
              alt={track.name}
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Classement par circuit */}
      <div className="bg-white rounded-lg shadow-md p-8 mt-8">
        <h2 className="text-2xl font-bold mb-6">Classements</h2>

        {layouts.length === 0 ? (
          <p className="text-gray-500">Aucun tracé disponible pour ce circuit.</p>
        ) : (
          <div className="space-y-6">
            {layouts.map((layout) => {
              const layoutLapTimes = lapTimesByLayout.get(layout.id) || [];
              const topLapTimes = layoutLapTimes.slice(0, 10);

              return (
                <div key={layout.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {layout.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Top 10
                    </span>
                  </div>

                  {topLapTimes.length === 0 ? (
                    <p className="text-gray-500">
                      Aucun temps validé pour ce tracé.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              #
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Pilote
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Voiture
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Temps
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {topLapTimes.map((lapTime, index) => (
                            <tr key={lapTime.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {index + 1}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                <Link
                                  href={`/profile/${lapTime.user.id}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {lapTime.user.name}
                                </Link>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {lapTime.carModel.make} {lapTime.carModel.model}
                                {lapTime.carModel.trim && ` ${lapTime.carModel.trim}`}
                              </td>
                              <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                                {formatLapTime(lapTime.timeMs)}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">
                                {new Date(lapTime.drivenAt).toLocaleDateString("fr-FR")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
