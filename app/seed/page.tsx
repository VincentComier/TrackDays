import { seedTrackLayouts } from "@/app/actions/seedTrackLayouts";

export default async function SeedPage() {
  const result = await seedTrackLayouts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seed Track Layouts</h1>
      {result.success ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-900">
            ✅ {result.layouts?.length} tracés créés avec succès !
          </p>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-900">❌ Erreur : {result.error}</p>
        </div>
      )}
    </div>
  );
}
