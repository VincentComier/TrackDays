"use client";

import { useState, useEffect } from "react";
import { getUserLapTimesWithFilters, getUserCarModels, getUserTracks } from "@/app/actions/getLapTimesWithFilters";
import Link from "next/link";

function formatLapTime(timeMs: number): string {
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs % 60000) / 1000);
  const milliseconds = timeMs % 1000;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds
    .toString()
    .padStart(3, "0")}`;
}

export default function HistoryPage({ userId }: { userId: string }) {
  const [lapTimes, setLapTimes] = useState<any[]>([]);
  const [carModels, setCarModels] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    trackId: "",
    status: "",
    carModelId: "",
    sortBy: "date" as "date" | "time",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [lapTimesResult, carModelsResult, tracksResult] = await Promise.all([
          getUserLapTimesWithFilters(userId, {
            trackId: filters.trackId || undefined,
            status: (filters.status as "verified" | "pending" | "rejected") || undefined,
            carModelId: filters.carModelId || undefined,
            sortBy: filters.sortBy,
          }),
          getUserCarModels(userId),
          getUserTracks(userId),
        ]);

        if (lapTimesResult.success) setLapTimes(lapTimesResult.lapTimes || []);
        if (carModelsResult.success) setCarModels(carModelsResult.carModels || []);
        if (tracksResult.success) setTracks(tracksResult.tracks || []);
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, userId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historique des temps</h1>
            <p className="text-gray-600 mt-1">Tous vos temps enregistrés avec filtres et tri</p>
          </div>
          <Link
            href={`/profile/${userId}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Retour au profil
          </Link>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Circuit
              </label>
              <select
                value={filters.trackId}
                onChange={(e) =>
                  setFilters({ ...filters, trackId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les circuits</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voiture
              </label>
              <select
                value={filters.carModelId}
                onChange={(e) =>
                  setFilters({ ...filters, carModelId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les voitures</option>
                {carModels.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.make} {car.model} {car.trim ? `(${car.trim})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="verified">Validé</option>
                <option value="pending">En attente</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tri
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as "date" | "time",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Plus récents d'abord</option>
                <option value="time">Plus rapides d'abord</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des temps */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Temps enregistrés ({lapTimes.length})
            </h2>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : lapTimes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Aucun temps ne correspond à ces filtres.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
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
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lapTimes.map((lapTime) => (
                    <tr key={lapTime.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(lapTime.drivenAt).toLocaleDateString("fr-FR")}
                      </td>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            lapTime.status === "verified"
                              ? "bg-green-100 text-green-800"
                              : lapTime.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {lapTime.status === "verified"
                            ? "Validé"
                            : lapTime.status === "pending"
                              ? "En attente"
                              : "Rejeté"}
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
