import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Peec AI Openings — Win in AI Search" },
      {
        name: "description",
        content:
          "Find the exact sources AI already reads, detect where your brand is missing, and generate source-specific actions to win AI search visibility.",
      },
      { property: "og:title", content: "Peec AI Openings — Win in AI Search" },
      {
        property: "og:description",
        content:
          "Source engagement autopilot for GEO. Built on the Peec AI MCP.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Peec AI Openings — Win in AI Search" },
      { name: "description", content: "Agent built by KitKat Bulls in Big Berlin Hackathon April 2026" },
      { property: "og:description", content: "Agent built by KitKat Bulls in Big Berlin Hackathon April 2026" },
      { name: "twitter:description", content: "Agent built by KitKat Bulls in Big Berlin Hackathon April 2026" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eec34eb1-4767-4137-8d57-1b9e6b0c6863/id-preview-3c01eb17--b533d8b7-6667-4ca3-bc0d-2a6194ca2091.lovable.app-1777202642674.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eec34eb1-4767-4137-8d57-1b9e6b0c6863/id-preview-3c01eb17--b533d8b7-6667-4ca3-bc0d-2a6194ca2091.lovable.app-1777202642674.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AppShell>
      <Outlet />
      <Toaster position="top-center" />
    </AppShell>
  );
}
