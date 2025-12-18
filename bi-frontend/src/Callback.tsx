import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Spinner } from "@/components/ui/spinner";

const CallbackPage: React.FC = () => {
  const { error } = useAuth0();

  if (error) {
    return (
      <span>{error.message}</span>
    );
  }

  return (<div className="flex items-center justify-center h-screen">
    <Spinner className="size-24" />
  </div>)
};

export default CallbackPage;
