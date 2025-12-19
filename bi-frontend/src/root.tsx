// import { Route } from "./+types/root";
import { isRouteErrorResponse, Outlet, Scripts, ScrollRestoration, useMatches } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import './index.css';
import { Auth0ProviderWithNavigate } from "./auth0-provider";
import { useEffect } from "react";
import queryClient from "@/query-client";
import { Spinner } from "./components/ui/spinner";

export function Layout({ children }) {
  const matches = useMatches();
  const { handle, data } = matches[matches.length - 1];
  const title = handle && (handle as any).title(data);

  useEffect(() => {
    if (title) {
      document.title = title
    }
  }, [title]);

  return (
    <html>
      <head>
        <link
          rel="icon"
          href="data:image/x-icon;base64,AA"
        />
        <title>{title || "The Baker's Index"}</title>
      </head>
      <body className="bg-sidebar text-stone-700">
        <Auth0ProviderWithNavigate>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </Auth0ProviderWithNavigate>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (<div className="flex flex-col items-center justify-center h-screen">
    <Spinner className="size-24" />
    <p className="font-bold">Loading..</p>
  </div>)
}

export function ErrorBoundary({ error }: { error: any }) {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

export default function App() {
  return <Outlet />;
}
