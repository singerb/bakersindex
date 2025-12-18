import { deleteFormula, type Formula, loadFormula } from "@/api";
import queryClient from "@/query-client";
import client from "@/auth0-client";
import { useNavigate, useRevalidator } from "react-router";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Table, TableCaption, TableHeader, TableHead, TableRow, TableBody, TableCell, TableFooter } from "@/components/ui/table";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export const handle = {
  title: (data: Formula | undefined) => "The Baker's Index - " + (data?.name || "Unknown formula"),
}

type FormulaParams = {
  formulaId: number;
};

export async function clientLoader({ params }: { params: FormulaParams }) {
  const formulaId = params.formulaId;
  if (!await client.isAuthenticated()) {
    await client.loginWithRedirect({ appState: { returnTo: `${window.location.pathname}${window.location.search}` } });
    return;
  }
  const token = await client.getTokenSilently();
  const query = queryClient.fetchQuery({ queryKey: ['formula', formulaId], queryFn: () => loadFormula(token, formulaId) });

  return await query;
}
clientLoader.hydrate = true as const;

function Formula({ loaderData: formula }: { loaderData: Formula | undefined }) {
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

  // TODO: eventually these need to be persisted per-formula in meta
  const [quantity, setQuantity] = useState(1);
  const [weightPer, setWeightPer] = useState(875);

  if (!formula) {
    return;
  }

  const handleDelete = async () => {
    // TODO: needs a dialog popup layer
    const token = await client.getTokenSilently();

    await deleteFormula(token, formula.id);

    // invalidate all formulas and refetch
    await queryClient.invalidateQueries({ queryKey: ["formulas"], refetchType: "all" });

    // redirect to the formulas page
    await navigate("/formulas");

    // revalidate the router; don't await since we can redirect while we revalidate
    // TODO: can we do this better with a fetcher or Form plus client action? How can we combine all that with tanstack form?
    revalidate();
  };

  // TODO: have a mode where you can enter target base yield
  const totalWeight = quantity * weightPer;

  // this sort() will handle all the other ones, so we only do it once
  // TODO: consider using math.js for better rounding/precision?
  const totalPercent = formula.parts.sort((a, b) => a.isBase ? -1 : (b.isBase ? 1 : 0)).reduce((acc, val) => acc + val.percent, 0);
  const baseWeight = totalWeight / totalPercent;

  return (
    // <div className="min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div className="grow-0 shrink self-start p-6 md:p-10">
      <h1 className="text-6xl">{formula.name}</h1>
      <FieldSet>
        <FieldLegend>Adjust quantities</FieldLegend>
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldLabel>Quantity</FieldLabel>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />
          </Field>
          <Field orientation="horizontal">
            <FieldLabel>Weight Per</FieldLabel>
            <Input type="number" value={weightPer} onChange={(e) => setWeightPer(parseFloat(e.target.value))} />
          </Field>
        </FieldGroup>
      </FieldSet>
      <Table>
        <TableCaption>Formula parts</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Ingredient</TableHead>
            <TableHead className="text-right">%</TableHead>
            <TableHead className="text-right">Weight</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formula.parts.map((part) => (
            <TableRow key={part.id}>
              <TableCell>{part.ingredient}</TableCell>
              <TableCell className="text-right">{part.percent}%</TableCell>
              <TableCell className="text-right">{(baseWeight * part.percent).toFixed(2)}g</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell className="text-right">{totalPercent}%</TableCell>
            <TableCell className="text-right">{totalWeight.toFixed(2)}g</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <Field orientation="horizontal">
        <Button onClick={handleDelete} className="self-start grow-0 shrink" variant="destructive"><Trash /> Delete</Button>
      </Field>
    </div>
  )
}

export default Formula
