import { createFormula } from "@/api";
import queryClient from "@/query-client";
import client from "@/auth0-client";
import { useForm } from "@tanstack/react-form"
import z from "zod";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useRevalidator } from "react-router";

export const handle = {
  title: () => "The Baker's Index - New formula",
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Formula name cannot be empty.")
})

function CreateFormula() {
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();
  const form = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: formSchema,
      onBlur: formSchema,
    },
    onSubmit: async ({ value }) => {
      // console.log(value);

      const token = await client.getTokenSilently();

      // await API post, get formula back
      const newFormula = await createFormula(token, value);
      // console.log(newFormula);

      // invalidate all formulas and refetch
      await queryClient.invalidateQueries({queryKey: ["formulas"], refetchType: "all"});

      // revalidate the router; don't await since we can redirect while we revalidate
      // TODO: can we do this better with a fetcher or Form plus client action? How can we combine all that with tanstack form?
      revalidate();

      // redirect to the formula page
      await navigate("/formula/" + newFormula.id);
    },
  });

  return (
    // <div className="min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div className="grow-0 shrink self-start p-6 md:p-10">
      <h1 className="text-6xl">New formula</h1>
      <div>
        <form
          id="formula-creation-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Formula name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Delicious bread"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
        <Field orientation="horizontal">
          <Button className="bg-amber-900 hover:bg-amber-950" type="submit" form="formula-creation-form">
              Submit
          </Button>
        </Field>
      </div>
    </div>
  )
}

export default CreateFormula
