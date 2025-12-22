import { deleteFormula, editFormula, type Formula, loadFormula } from "@/api";
import queryClient from "@/query-client";
import client from "@/auth0-client";
import { useNavigate, useRevalidator } from "react-router";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Table, TableCaption, TableHeader, TableHead, TableRow, TableBody, TableCell, TableFooter } from "@/components/ui/table";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import FormulaForm, { type FormSchema } from "@/components/formula-form";

export const handle = {
  title: (data: Formula | undefined) => "The Baker's Index - " + (data?.name || "Unknown formula"),
}

type FormulaParams = {
  formulaId: number;
};

type State = "normal" | "editing" | "deleting";

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
  const [state, setState] = useState<State>("normal");

  // TODO: eventually these need to be persisted per-formula in meta
  const [quantity, setQuantity] = useState(1);
  const [weightPer, setWeightPer] = useState(875);

  if (!formula) {
    return;
  }

  const handleDelete = async () => {
    setState("deleting");

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

  const handleEdit = () => {
    setState("editing");
  };

  // TODO: have a mode where you can enter target base yield
  const totalWeight = quantity * weightPer;

  // this sort() will handle all the other ones, so we only do it once
  // TODO: consider using math.js for better rounding/precision?
  const totalPercent = formula.parts.sort((a, b) => a.isBase ? -1 : (b.isBase ? 1 : 0)).reduce((acc, val) => acc + val.percent, 0);
  const baseWeight = totalWeight / totalPercent;

  if (state === "deleting") {
    // TODO: this could be nicer as an translucent overlay
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner className="size-24 text-red-600" />
        <p className="text-red-600 font-bold">Deleting...</p>
      </div>
    );
  }

  if (state === "editing") {
    const defaultValues = {
      ...formula,
      baseIndex: formula.parts.findIndex((part) => part.isBase).toString(),
    };

    const submitFn = async ({ value }: { value: FormSchema }) => {
      const token = await client.getTokenSilently();

      // await API post, get formula back
      await editFormula(token, formula.id, value);
      // console.log(newFormula);

      // invalidate all formulas and refetch
      await queryClient.invalidateQueries({ queryKey: ["formulas"], refetchType: "all" });

      // revalidate the router
      // TODO: can we do this better with a fetcher or Form plus client action? How can we combine all that with tanstack form?
      await revalidate();

      // stop editing
      setState("normal");
    };

    const cancelFn = () => {
      setState("normal");
    };

    return <FormulaForm defaultValues={defaultValues} submitFn={submitFn} formTitle={"Edit " + formula.name} cancelFn={cancelFn} submitText="Saving..." submitButtonText="Save" />
  }

  return (
    <div className="grow-0 shrink self-start px-10 pt-0 pb-10">
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
        <Button onClick={handleEdit} className="self-start grow-0 shrink"><Pencil /> Edit</Button>
        <Button onClick={handleDelete} className="self-start grow-0 shrink" variant="destructive"><Trash /> Delete</Button>
      </Field>
    </div>
  )
}

export default Formula
