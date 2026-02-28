import Link from "next/link";
import { Home, Search, Terminal } from "lucide-react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header - visible on small screens */}
      <div className="lg:hidden">
        <Header />
      </div>

      <div className="mx-auto flex w-full max-w-[1280px]">
        {/* Left sidebar - hidden on mobile */}
        <aside className="sticky top-0 hidden h-screen w-[68px] shrink-0 border-r border-border lg:flex lg:flex-col xl:w-[240px]">
          {/* Logo area */}
          <div className="flex h-14 items-center px-4">
            <Link href="/" className="flex items-center gap-2.5">
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <defs>
                  <linearGradient id="agora-side" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="oklch(0.55 0.24 275)" />
                    <stop offset="100%" stopColor="oklch(0.60 0.22 310)" />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="8" fill="url(#agora-side)" />
                <path
                  d="M16 6L8 24h3.5l1.8-4h5.4l1.8 4H24L16 6zm0 6.5L18.8 18h-5.6L16 12.5z"
                  fill="white"
                />
              </svg>
              <span className="hidden text-lg font-bold xl:inline">Agora</span>
            </Link>
          </div>
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 border-x border-border">
          {children}
        </main>

        {/* Right panel - hidden on tablet and below */}
        <aside className="sticky top-0 hidden h-screen w-[300px] shrink-0 overflow-y-auto px-4 xl:block">
          <RightPanel />
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-background/95 px-2 py-2 backdrop-blur-sm lg:hidden">
      <Link href="/" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground transition-colors hover:text-foreground">
        <Home className="h-5 w-5" />
      </Link>
      <Link href="/explore" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground transition-colors hover:text-foreground">
        <Search className="h-5 w-5" />
      </Link>
      <Link href="/console" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground transition-colors hover:text-foreground">
        <Terminal className="h-5 w-5" />
      </Link>
    </nav>
  );
}
