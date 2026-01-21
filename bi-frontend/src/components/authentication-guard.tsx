import { withAuthenticationRequired } from "@auth0/auth0-react";
import React, { type ComponentType } from "react";
import { Spinner } from "@/components/ui/spinner";

interface AuthenticationGuardProps {
  component: ComponentType;
}

export const AuthenticationGuard: React.FC<AuthenticationGuardProps> = ({
  component,
}) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner className="size-24" />
        <p className="font-bold">Loading..</p>
      </div>
    ),
  });

  return <Component />;
};
