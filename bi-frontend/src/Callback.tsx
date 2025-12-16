import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

export const CallbackPage: React.FC = () => {
  const { error } = useAuth0();

  if (error) {
    return (
              <span>{error.message}</span>
    );
  }

  return (
  <span>What here?</span>
  );
};
