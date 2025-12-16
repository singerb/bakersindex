import { type Formula, loadFormula } from "@/api";
import queryClient from "@/query-client";
import client from "@/auth0-client";

export const handle = {
  title: (data: Formula | undefined) => "The Baker's Index - " + (data?.name || "Unknown formula"),
}

type FormulaParams = {
  formulaId: number;
};

export async function clientLoader({ params }: { params: FormulaParams }) {
  const formulaId = params.formulaId;
  if (!await client.isAuthenticated()) {
    await client.loginWithRedirect({appState: {returnTo: `${window.location.pathname}${window.location.search}`}});
    return;
  }
  const token = await client.getTokenSilently();
  const query = queryClient.fetchQuery({ queryKey: ['formula', formulaId], queryFn: () => loadFormula(token, formulaId)});

  return await query;
}
clientLoader.hydrate = true as const;

function Formula({loaderData: formula}: {loaderData: Formula | undefined}) {
  if (!formula) {
    return;
  }

  return (
    <div className="min-h-svh w-full items-center justify-center p-6 md:p-10">
      <h1 className="text-6xl">{formula.name}</h1>
      <div>
        <p>Show formula details here</p>
      </div>
    </div>
  )
}

export default Formula
