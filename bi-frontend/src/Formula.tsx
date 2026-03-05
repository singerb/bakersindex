import { deleteFormula, editFormula, type Formula, loadFormula, patchFormulaMetas, upsertMeta } from "@/api";
import queryClient from "@/query-client";
import client from "@/auth0-client";
import { useNavigate, useRevalidator } from "react-router";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Table, TableCaption, TableHeader, TableHead, TableRow, TableBody, TableCell, TableFooter } from "@/components/ui/table";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import FormulaForm, { type FormSchema } from "@/components/formula-form";
import { Card, CardContent } from "@/components/ui/card";

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

  const [quantity, setQuantity] = useState(() => {
    const v = formula.metas.find((m) => m.type === "quantity")?.value;
    return v ? parseInt(v) : 1;
  });
  const [weightPer, setWeightPer] = useState(() => {
    const v = formula.metas.find((m) => m.type === "weightPer")?.value;
    return v ? parseFloat(v) : 875;
  });

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveMetas = async (q: number, w: number) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
    const token = await client.getTokenSilently();
    await patchFormulaMetas(token, formula.id, [
      { type: "quantity", value: String(q) },
      { type: "weightPer", value: String(w) },
    ]);
  };

  const scheduleSave = (q: number, w: number) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveMetas(q, w), 800);
  };

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
      description: formula.metas.find((m) => m.type === "description")?.value ?? "",
    };

    const submitFn = async ({ value }: { value: FormSchema }) => {
      const token = await client.getTokenSilently();

      // await API post, get formula back
      const metas = upsertMeta(formula.metas, "description", value.description);
      await editFormula(token, formula.id, { ...value, metas });
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
    <div className="px-10 pt-0 pb-10">
      <h1 className="text-6xl">{formula.name}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 w-full gap-4 my-4">
        <Card className="min-w-2xs lg:min-w-auto">
          <CardContent>
            <FieldSet>
              <FieldLegend>Adjust quantities</FieldLegend>
              <FieldGroup>
                <Field orientation="horizontal">
                  <FieldLabel>Quantity</FieldLabel>
                  <Input type="number" value={quantity} onChange={(e) => { const v = parseInt(e.target.value); setQuantity(v); scheduleSave(v, weightPer); }} onBlur={() => saveMetas(quantity, weightPer)} />
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel>Weight Per</FieldLabel>
                  <Input type="number" value={weightPer} onChange={(e) => { const v = parseFloat(e.target.value); setWeightPer(v); scheduleSave(quantity, v); }} onBlur={() => saveMetas(quantity, weightPer)} />
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>
        <Card className="min-w-2xs lg:min-w-auto">
          <CardContent>
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
          </CardContent>
        </Card>
        <Card className="min-w-2xs lg:min-w-auto">
          <CardContent>
            <h3 className="text-2xl">Description</h3>
            <p>{formula.metas.find((m) => m.type === "description")?.value || "No description."}</p>
          </CardContent>
        </Card>
      </div>
      <Field orientation="horizontal" className="mt-4">
        <Button onClick={handleEdit} className="self-start grow-0 shrink"><Pencil /> Edit</Button>
        <Button onClick={handleDelete} className="self-start grow-0 shrink" variant="destructive"><Trash /> Delete</Button>
      </Field>
    </div>
  )
}

export default Formula
