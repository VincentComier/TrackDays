import LapTimeForm from "../components/LapTimeForm";

export default function LapTimesPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Ajouter un temps</h1>
      <p className="text-gray-600">
        Choisis un modèle depuis l'API, sélectionne un circuit et saisis ton temps pour l'enregistrer dans la base.
      </p>
      <LapTimeForm />
    </div>
  );
}
