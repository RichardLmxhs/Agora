import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { Header } from "~/components/layout/Header";
import { LoginForm } from "~/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/console");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4">
        <LoginForm />
      </main>
    </div>
  );
}
