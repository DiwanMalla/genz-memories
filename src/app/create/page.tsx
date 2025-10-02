import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreatePageClient } from "@/components/pages/create-page-client";

export default async function CreatePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <CreatePageClient />;
}
