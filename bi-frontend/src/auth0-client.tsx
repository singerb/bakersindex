import { Auth0Client } from "@auth0/auth0-spa-js";
import type { AppState } from "@/auth0/auth0-provider";

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const redirectUri = import.meta.env.VITE_AUTH0_CALLBACK_URL;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

if (!(domain && clientId && redirectUri && audience)) {
  throw new Error("Auth0 not configured!");
}

const client = new Auth0Client({domain, clientId, authorizationParams: { redirect_uri: redirectUri, audience }});

export const onRedirectCallback = (appState?: AppState) => {
  window.history.replaceState(
    {},
    document.title,
    appState!.returnTo ?? window.location.pathname
  );
};

export default client;
