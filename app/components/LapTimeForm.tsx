"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { CarModelSelector } from "./CarModelSelector";
import { createLapTime } from "@/app/actions/createLapTime";
import { createCarModelFromApi } from "@/app/actions/createCarModelFromApi";
import { getAllTrackLayoutsWithTrack } from "@/app/actions/getTrackLayouts";
import { useSession } from "@/lib/auth-client";

interface LayoutOption {
  id: string;
  name: string;
  trackId: string;
  trackName?: string | null;
}

export default function LapTimeForm() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "";

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [trackLayoutId, setTrackLayoutId] = useState("");
  const [minutes, setMinutes] = useState("0");
  const [seconds, setSeconds] = useState("0");
  const [milliseconds, setMilliseconds] = useState("0");
  const [drivenAt, setDrivenAt] = useState("");

  const [layouts, setLayouts] = useState<LayoutOption[]>([]);
  const [loadingLayouts, setLoadingLayouts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadLayouts = async () => {
      setLoadingLayouts(true);
      try {
        const result = await getAllTrackLayoutsWithTrack();
        if (result.success) {
          setLayouts(result.layouts || []);
        } else {
          setError("Impossible de charger les tracés de circuit");
        }
      } catch (err) {
        console.error("Error loading layouts", err);
        setError("Erreur lors du chargement des tracés");
      } finally {
        setLoadingLayouts(false);
      }
    };

    loadLayouts();
  }, []);

  const handleCarSelect = (make: string, model: string) => {
    setSelectedMake(make);
    setSelectedModel(model);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedMake || !selectedModel) {
      setError("Choisissez un modèle de voiture");
      return;
    }
    if (!userId) {
      setError("Vous devez être connecté pour enregistrer un temps");
      return;
    }
    if (!trackLayoutId) {
      setError("Choisissez un tracé de circuit");
      return;
    }

    const min = Number(minutes) || 0;
    const sec = Number(seconds) || 0;
    const ms = Number(milliseconds) || 0;
    const totalMs = min * 60_000 + sec * 1_000 + ms;

    if (!Number.isFinite(totalMs) || totalMs <= 0) {
      setError("Indique un temps valide (min, sec, ms)");
      return;
    }

    const drivenDate = drivenAt ? new Date(drivenAt) : new Date();

    setSubmitting(true);
    try {
      // 1. Créer ou récupérer le car model
      const carModelResult = await createCarModelFromApi({
        make: selectedMake,
        model: selectedModel,
      });

      if (!carModelResult.success || !carModelResult.carModel) {
        setError("Impossible d'enregistrer le véhicule");
        setSubmitting(false);
        return;
      }

      // 2. Créer le lap time
      const result = await createLapTime({
        userId,
        trackLayoutId,
        carModelId: carModelResult.carModel.id,
        timeMs: totalMs,
        drivenAt: drivenDate,
        source: "manual",
      });

      if (result.success) {
        setSuccess("Temps enregistré avec succès");
        setSelectedMake("");
        setSelectedModel("");
        setTrackLayoutId("");
        setMinutes("0");
        setSeconds("0");
        setMilliseconds("0");
        setDrivenAt("");
      } else {
        setError(result.error || "Impossible d'enregistrer ce temps");
      }
    } catch (err) {
      console.error("Error creating lap time", err);
      setError("Erreur lors de l'enregistrement du temps");
    } finally {
      setSubmitting(false);
    }
  };

  const layoutOptions = useMemo(
    () =>
      layouts.map((layout) => ({
        value: layout.id,
        label: `${layout.trackName || "Circuit"} - ${layout.name}`,
      })),
    [layouts]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-lg font-semibold">Sélection du véhicule</h2>
        <CarModelSelector onSelect={handleCarSelect} />
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <h2 className="text-lg font-semibold">Informations sur la session</h2>

        {session?.user && (
          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-sm text-blue-900">
              Connecté en tant que: <strong>{session.user.name}</strong>
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Circuit / tracé</label>
          <select
            value={trackLayoutId}
            onChange={(e) => setTrackLayoutId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            disabled={loadingLayouts}
          >
            <option value="">Choisir un tracé</option>
            {layoutOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {loadingLayouts && <p className="text-sm text-gray-500 mt-1">Chargement des tracés...</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Temps au tour</label>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              min="0"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Minutes"
            />
            <input
              type="number"
              min="0"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Secondes"
            />
            <input
              type="number"
              min="0"
              value={milliseconds}
              onChange={(e) => setMilliseconds(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Millisecondes"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Date du roulage</label>
          <input
            type="date"
            value={drivenAt}
            onChange={(e) => setDrivenAt(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
      >
        {submitting ? "Enregistrement..." : "Enregistrer le temps"}
      </button>
    </form>
  );
}
