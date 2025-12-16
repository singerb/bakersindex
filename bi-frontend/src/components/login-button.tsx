import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export const LoginButton: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    await loginWithRedirect({
      appState: {
        returnTo: "/formulas",
      },
      authorizationParams: {
        prompt: "login",
      },
    });
  };

  return <Button onClick={handleLogin} size="lg" className="bg-amber-900 hover:bg-amber-950"><ArrowUpRight/>Log In</Button>;
};
