import { deleteFormula, type Formula, loadFormula } from "@/api";
import queryClient from "@/query-client";
import client from "@/auth0-client";
import { useNavigate, useRevalidator } from "react-router";
import { Field } from "./components/ui/field";
import { Button } from "./components/ui/button";
import { Trash } from "lucide-react";

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
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

  if (!formula) {
    return;
  }

  const handleDelete = async () => {
    // TODO: needs a dialog popup layer
    const token = await client.getTokenSilently();

    await deleteFormula(token, formula.id);

    // invalidate all formulas and refetch
    await queryClient.invalidateQueries({queryKey: ["formulas"], refetchType: "all"});

    // redirect to the formulas page
    await navigate("/formulas");

    // revalidate the router; don't await since we can redirect while we revalidate
    // TODO: can we do this better with a fetcher or Form plus client action? How can we combine all that with tanstack form?
    revalidate();
  };

  return (
    // <div className="min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div className="grow-0 shrink self-start p-6 md:p-10">
      <h1 className="text-6xl">{formula.name}</h1>
      <div>
        <p>Show formula details here</p>
      </div>
      <Field orientation="horizontal">
        <Button onClick={handleDelete} className="self-start grow-0 shrink" variant="destructive"><Trash/> Delete</Button>
      </Field>
    </div>
  )
}

export default Formula
