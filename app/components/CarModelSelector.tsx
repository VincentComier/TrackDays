"use client";

import { useEffect, useMemo, useState } from "react";

type VehicleOption = {
  make: string;
  model: string;
  year?: number;
};

interface CarModelSelectorProps {
  onSelect: (make: string, model: string) => void;
}

export function CarModelSelector({ onSelect }: CarModelSelectorProps) {
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<VehicleOption[]>([]);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModelKey, setSelectedModelKey] = useState<string>("");

  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    loadMakes();
  }, []);

  const loadMakes = async () => {
    setLoadingMakes(true);
    try {
      const response = await fetch("/api/cars/makes");
      const data = await response.json();
      if (data.success) {
        setMakes(data.makes || []);
      }
    } catch (error) {
      console.error("Error loading makes", error);
    } finally {
      setLoadingMakes(false);
    }
  };

  const loadModels = async (make: string) => {
    if (!make) {
      setModels([]);
      return;
    }

    setLoadingModels(true);
    try {
      const response = await fetch(`/api/cars/search?make=${encodeURIComponent(make)}`);
      const data = await response.json();
      if (data.success) {
        setModels(data.vehicles || []);
      }
    } catch (error) {
      console.error("Error loading models", error);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleMakeChange = (newMake: string) => {
    setSelectedMake(newMake);
    setSelectedModelKey("");
    loadModels(newMake);
  };

  const handleModelChange = (key: string) => {
    setSelectedModelKey(key);
    const vehicle = parsedModelOptions.find((option) => option.key === key);
    if (vehicle) {
      onSelect(vehicle.value.make, vehicle.value.model);
    }
  };

  const parsedModelOptions = useMemo(
    () =>
      models.map((vehicle, idx) => ({
        key: `${vehicle.model}-${idx}`,
        label: `${vehicle.make} - ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ""}`,
        value: vehicle,
      })),
    [models]
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Marque</label>
        <select
          value={selectedMake}
          onChange={(e) => handleMakeChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Sélectionner une marque</option>
          {makes.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
        {loadingMakes && <p className="text-sm text-gray-500 mt-1">Chargement des marques...</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Modèle</label>
        <select
          value={selectedModelKey}
          onChange={(e) => handleModelChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          disabled={!selectedMake || loadingModels}
        >
          <option value="">Sélectionner un modèle</option>
          {parsedModelOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        {loadingModels && <p className="text-sm text-gray-500 mt-1">Chargement des modèles...</p>}
      </div>
    </div>
  );
}
