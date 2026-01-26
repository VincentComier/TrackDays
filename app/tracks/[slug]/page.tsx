import { getTrackBySlug } from "@/app/actions/getTrackBySlug";
import { notFound } from "next/navigation";
import Link from "next/link";

interface TrackDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TrackDetailPage({ params }: TrackDetailPageProps) {
  const { slug } = await params;
  const result = await getTrackBySlug(slug);

  if (!result.success || !result.track) {
    notFound();
  }

  const track = result.track;

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
    </div>
  );
}
