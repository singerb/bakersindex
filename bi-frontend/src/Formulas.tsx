import { Link } from "react-router";
import { loadFormulas, type Formulas } from "./api"
import queryClient from "@/query-client";
import client from "@/auth0-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const handle = {
  title: () => "The Baker's Index - Formulas",
}

export async function clientLoader() {
  if (!await client.isAuthenticated()) {
    await client.loginWithRedirect({ appState: { returnTo: `${window.location.pathname}${window.location.search}` } });
    return;
  }
  const token = await client.getTokenSilently();
  const query = queryClient.fetchQuery({ queryKey: ['formulas'], queryFn: () => loadFormulas(token) });

  return await query;
}
clientLoader.hydrate = true as const;

function Formulas({ loaderData: formulas }: { loaderData: Formulas | undefined }) {
  return (
    <div className="min-h-svh w-full items-center justify-center px-10 pt-0 pb-10">
      <h1 className="text-6xl">Formulas</h1>
      <div className="flex flex-row flex-wrap">
        {(formulas || []).map((item) => (
          <Card className="mt-4 mr-4 w-2xs min-w-3xs" key={item.id}>
            <CardHeader>
              <CardTitle>
                <Link to={"/formula/" + item.id}>{item.name}</Link>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Formulas;
