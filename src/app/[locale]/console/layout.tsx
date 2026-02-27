import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
