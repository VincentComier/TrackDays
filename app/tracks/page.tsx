import { getTracks } from "../actions/getTracks";
import Link from "next/link";

export default async function TracksPage() {
  const tracks = await getTracks();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Circuits</h1>
      
      {tracks && tracks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <Link
              key={track.id}
              href={`/tracks/${track.slug}`}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <h2 className="text-xl font-semibold mb-2">{track.name}</h2>
              <p className="text-gray-600 mb-2">{track.country}</p>
              {track.lengthKm && (
                <p className="text-sm text-gray-500">{track.lengthKm} km</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Aucun circuit disponible pour le moment.</p>
      )}
    </div>
  );
}
