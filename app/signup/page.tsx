import SignupForm from "@/app/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Créer un compte</h1>
      <SignupForm />
    </div>
  );
}
