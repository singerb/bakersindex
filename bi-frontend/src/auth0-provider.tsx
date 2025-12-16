import { type AppState } from "@auth0/auth0-react";
import Auth0Provider from "@/auth0/auth0-provider";
import React, { type JSX, type PropsWithChildren } from "react";
import { useNavigate } from "react-router";
import client from "@/auth0-client";

interface Auth0ProviderWithNavigateProps {
  children: React.ReactNode;
}

export const Auth0ProviderWithNavigate = ({
  children,
}: PropsWithChildren<Auth0ProviderWithNavigateProps>): JSX.Element | null => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: AppState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      client={client}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
