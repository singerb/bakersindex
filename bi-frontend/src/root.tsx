import { isRouteErrorResponse, Links, Outlet, Scripts, ScrollRestoration, useMatches } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import './index.css';
import { Auth0ProviderWithNavigate } from "./auth0-provider";
import { useEffect, type ReactNode } from "react";
import queryClient from "@/query-client";
import { Spinner } from "@/components/ui/spinner";
import { EnvTag } from "@/components/env-tag";

export function Layout({ children }: { children: ReactNode }) {
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
          type="image/svg+xml"
          href="data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg width='41.797821mm' height='40.620415mm' viewBox='0 0 41.797821 40.620415' version='1.1' id='svg1' inkscape:version='1.4.2 (ebf0e940, 2025-05-08)' sodipodi:docname='favicon.svg' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Csodipodi:namedview id='namedview1' pagecolor='%23ffffff' bordercolor='%23000000' borderopacity='0.25' inkscape:showpageshadow='2' inkscape:pageopacity='0.0' inkscape:pagecheckerboard='0' inkscape:deskcolor='%23d1d1d1' inkscape:document-units='mm' inkscape:zoom='0.89887065' inkscape:cx='-10.568818' inkscape:cy='76.206738' inkscape:window-width='1776' inkscape:window-height='1308' inkscape:window-x='2738' inkscape:window-y='304' inkscape:window-maximized='0' inkscape:current-layer='layer1' /%3E%3Cdefs id='defs1' /%3E%3Cg inkscape:label='Layer 1' inkscape:groupmode='layer' id='layer1' transform='translate(-84.101089,-128.18979)'%3E%3Cellipse style='fill:%23ffffff;stroke:none;stroke-width:2.64583' id='path6' cx='105' cy='148.5' rx='20.898911' ry='20.310207' /%3E%3Cg style='fill:none;stroke:%237b3306;stroke-width:1.875;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1' id='g2' transform='matrix(1.4111111,0,0,1.4111111,87.704181,131.20418)'%3E%3Cpath d='M 10.2,18 H 4.774 A 1.5,1.5 0 0 1 3.422,17.03 11,11 0 0 1 3.554,10.543' id='path1' style='stroke:%237b3306;stroke-width:1.875;stroke-dasharray:none;stroke-opacity:1' /%3E%3Cpath d='M 18,10.2 V 4.774 A 1.5,1.5 0 0 0 17.03,3.422 11,11 0 0 0 10.544,3.554' id='path2' style='stroke:%237b3306;stroke-width:1.875;stroke-dasharray:none;stroke-opacity:1' /%3E%3Cpath d='m 18,5 a 4,3 0 0 1 4,3 2,2 0 0 1 -2,2 10,10 0 0 0 -5.139,1.42' id='path3' style='stroke:%237b3306;stroke-width:1.875;stroke-dasharray:none;stroke-opacity:1' /%3E%3Cpath d='m 5,18 a 3,4 0 0 0 3,4 2,2 0 0 0 2,-2 10,10 0 0 1 1.42,-5.14' id='path4' style='stroke:%237b3306;stroke-width:1.875;stroke-dasharray:none;stroke-opacity:1' /%3E%3Cpath d='M 8.709,2.554 A 10,10 0 0 0 2.554,8.709 1.5,1.5 0 0 0 3.23,10.335 l 9.807,5.42 a 2,2 0 0 0 2.718,-2.718 L 10.335,3.23 A 1.5,1.5 0 0 0 8.709,2.554' id='path5' style='stroke:%237b3306;stroke-width:1.875;stroke-dasharray:none;stroke-opacity:1' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A"
        />
        <Links />
        <title>{title || "The Baker's Index"}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body className="bg-sidebar text-stone-700">
        <Auth0ProviderWithNavigate>
          <QueryClientProvider client={queryClient}>
            <>
              <EnvTag />
              {children}
            </>
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
  if (import.meta.env.DEV) {
    if (isRouteErrorResponse(error)) {
      return (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-red-600 text-6xl block py-4">
            {error.status} {error.statusText}
          </h1>
          <p>{error.data}</p>
        </div>
      );
    } else if (error instanceof Error) {
      return (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-red-600 text-6xl block py-4">Error</h1>
          <p>{error.message}</p>
          <p>The stack trace is:</p>
          <pre>{error.stack}</pre>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-red-600 text-6xl block py-4">Unknown Error</h1>;
        </div>
      );
    }
  } else {
    return (
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-red-600 text-6xl block py-4">Error</h1>
        <p>An unexpected error occurred; please refresh and try again.</p>
      </div>
    );
  }
}

export default function App() {
  return <Outlet />;
}
