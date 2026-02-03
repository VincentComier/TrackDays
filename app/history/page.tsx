import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HistoryClient from "@/app/components/HistoryClient";

export default async function HistoryPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <HistoryClient userId={session.user.id} />;
}
