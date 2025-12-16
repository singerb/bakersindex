import { Link } from "react-router";
import { loadFormulas, type Formulas } from "./api"
import queryClient from "@/query-client";
import client from "@/auth0-client";

export const handle = {
  title: () => "The Baker's Index - Formulas",
}

export async function clientLoader() {
  if (!await client.isAuthenticated()) {
    await client.loginWithRedirect({appState: {returnTo: `${window.location.pathname}${window.location.search}`}});
    return;
  }
  const token = await client.getTokenSilently();
  const query = queryClient.fetchQuery({ queryKey: ['formulas'], queryFn: () => loadFormulas(token)});

  return await query;
}
clientLoader.hydrate = true as const;

function Formulas({loaderData: formulas}: {loaderData: Formulas | undefined}) {
  return (
    <div className="min-h-svh w-full items-center justify-center p-6 md:p-10">
      <h1 className="text-6xl">Formulas</h1>
      <ul>
      {(formulas || []).map((item) => (
        <li key={item.id}>
          <Link to={"/formula/" + item.id}>{item.name}</Link>
        </li>
      ))}
      </ul>
    </div>
  )
}

export default Formulas;
