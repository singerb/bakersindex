import { createFormula } from "@/api";
import queryClient from "@/query-client";
import client from "@/auth0-client";
import { useNavigate, useRevalidator } from "react-router";
import FormulaForm, { type FormSchema } from "@/components/formula-form";

export const handle = {
  title: () => "The Baker's Index - New formula",
}

function CreateFormula() {
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();

  const defaultValues = {
    name: "",
    parts: [{ ingredient: "Flour", percent: 100.0, isBase: true }],
    baseIndex: "0",
  };

  const submitFn = async ({ value }: { value: FormSchema }) => {
    const token = await client.getTokenSilently();

    // await API post, get formula back
    const newFormula = await createFormula(token, value);
    // console.log(newFormula);

    // invalidate all formulas and refetch
    await queryClient.invalidateQueries({ queryKey: ["formulas"], refetchType: "all" });

    // revalidate the router; don't await since we can redirect while we revalidate
    // TODO: can we do this better with a fetcher or Form plus client action? How can we combine all that with tanstack form?
    revalidate();

    // redirect to the formula page
    await navigate("/formula/" + newFormula.id);
  };

  return <FormulaForm defaultValues={defaultValues} submitFn={submitFn} formTitle="New formula" submitText="Creating..." submitButtonText="Create" />
}

export default CreateFormula
