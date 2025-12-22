import { useForm } from "@tanstack/react-form"
import z from "zod";
import { FieldGroup, Field, FieldLabel, FieldError, FieldLegend, FieldDescription, FieldSet, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { XIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

type State = "normal" | "submitting";

// we have IDs in this schema so that when we use the form to edit existing formulas, we can pass it in complete with the IDs
// new formulas don't have IDs yet though, so they're optional
// same logic for the parts
const formSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(1, "Formula name cannot be empty."),
  parts: z.array(z.object({
    id: z.number().optional(),
    ingredient: z.string().min(1, "Ingredient cannot be empty."),
    percent: z.float32().min(0.0, "Percent must be between 0 and 100.").max(100.0, "Percent must be between 0 and 100."),
    isBase: z.boolean()
  })).min(1, "Formula must have at least 1 ingredient."),
  // TODO: use .refine() on this array to validate 1 and only 1 element has isBase
  // TODO: use .refine() on this array to validate that the 1 base elemenet has 100% set
  // TODO: use .refine() on this array to validate that ingredients are unique?
  baseIndex: z.string(), // TODO: this is annoying but makes the select easier
});

export type FormSchema = z.infer<typeof formSchema>;

interface FormulaFormProps {
  submitText: string;
  submitButtonText: string;
  formTitle: string;
  submitFn: ({ value }: { value: FormSchema }) => Promise<void>;
  defaultValues: FormSchema;
  cancelFn?: () => void;
}

function FormulaForm({ submitFn, cancelFn, submitText, submitButtonText, formTitle, defaultValues }: FormulaFormProps) {
  const [state, setState] = useState<State>("normal");

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: formSchema,
      onBlur: formSchema,
    },
    onSubmit: async ({ value }) => {
      // console.log(value);
      setState("submitting");

      await submitFn({ value });
    },
  });

  if (state === "submitting") {
    // TODO: this could be nicer as an translucent overlay
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner className="size-24" />
        <p className="font-bold">{submitText}</p>
      </div>
    );
  }

  return (
    // <div className="min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div className="grow-0 shrink self-start p-6 md:p-10">
      <h1 className="text-6xl">{formTitle}</h1>
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
          <form.Field name="parts" mode="array">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <FieldSet>
                  <FieldLegend>Ingredients</FieldLegend>
                  <FieldDescription>Enter your formula ingredients here and select the base ingredient (typically your flour; must have 100% set).</FieldDescription>
                  <FieldGroup>
                    {field.state.value.map((_, index) => (
                      <div key={`fields-${index}`}>
                        <form.Field
                          key={`ingredient-${index}`}
                          name={`parts[${index}].ingredient`}
                          children={(subField) => {
                            const isSubFieldInvalid =
                              subField.state.meta.isTouched &&
                              !subField.state.meta.isValid
                            return (
                              <Field
                                orientation="horizontal"
                                data-invalid={isSubFieldInvalid}
                              >
                                <FieldLabel htmlFor={subField.name}>Ingredient</FieldLabel>
                                <FieldContent>
                                  <InputGroup>
                                    <InputGroupInput
                                      id={`form-array-parts-ingredients-${index}`}
                                      name={subField.name}
                                      value={subField.state.value}
                                      onBlur={subField.handleBlur}
                                      onChange={(e) =>
                                        subField.handleChange(e.target.value)
                                      }
                                      aria-invalid={isSubFieldInvalid}
                                      placeholder="Ingredient"
                                      type="text"
                                      autoComplete="off"
                                    />
                                    {field.state.value.length > 1 && (
                                      <InputGroupAddon align="inline-end">
                                        <InputGroupButton
                                          type="button"
                                          variant="ghost"
                                          size="icon-xs"
                                          onClick={() => field.removeValue(index)}
                                          aria-label={`Remove ingredient ${index + 1}`}
                                        >
                                          <XIcon />
                                        </InputGroupButton>
                                      </InputGroupAddon>
                                    )}
                                  </InputGroup>
                                  {isSubFieldInvalid && (
                                    <FieldError
                                      errors={subField.state.meta.errors}
                                    />
                                  )}
                                </FieldContent>
                              </Field>
                            )
                          }}
                        />
                        <form.Field
                          key={`percent-$(index}`}
                          name={`parts[${index}].percent`}
                          children={(subField) => {
                            const isSubFieldInvalid =
                              subField.state.meta.isTouched &&
                              !subField.state.meta.isValid
                            return (
                              <Field
                                orientation="horizontal"
                                data-invalid={isSubFieldInvalid}
                              >
                                <FieldLabel htmlFor={subField.name}>Percent</FieldLabel>
                                <FieldContent>
                                  <InputGroup>
                                    <InputGroupInput
                                      id={`form-array-parts-percents-${index}`}
                                      name={subField.name}
                                      value={subField.state.value}
                                      onBlur={subField.handleBlur}
                                      onChange={(e) =>
                                        subField.handleChange(parseFloat(e.target.value))
                                      }
                                      aria-invalid={isSubFieldInvalid}
                                      placeholder="Ingredient"
                                      type="number"
                                      autoComplete="off"
                                    />
                                  </InputGroup>
                                  {isSubFieldInvalid && (
                                    <FieldError
                                      errors={subField.state.meta.errors}
                                    />
                                  )}
                                </FieldContent>
                              </Field>
                            )
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => field.pushValue({ ingredient: "", percent: 0.0, isBase: false })}
                      disabled={field.state.value.length >= 5}
                    >
                      Add Ingredient
                    </Button>
                  </FieldGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </FieldSet>
              )
            }}
          </form.Field>
          <form.Subscribe
            selector={(state) => state.values.parts}
            children={(parts) => (
              <form.Field
                name="baseIndex"
                listeners={{
                  onChange: ({ value }) => {
                    // console.log("Base changed to " + value);
                    const newIndex = parseInt(value); // this is the flipside to the baseIndex: z.string() in the schema
                    form.setFieldValue("parts", (prev) => prev.map((part, index) => index !== newIndex ? { ...part, isBase: false } : { ...part, isBase: true }));
                  },
                }}
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel>Base ingredient</FieldLabel>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      <Select
                        name={field.name}
                        value={field.state.value.toString()}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger
                          id="formula-creation-select-base"
                          aria-invalid={isInvalid}
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          {parts.map((part, index) => (
                            <SelectItem key={`ingredient-select-${index}`} value={index.toString()}>{part.ingredient} ({part.percent}%)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Select the base ingredient for this formula; this is typically the flour, and must be set to 100%.
                      </FieldDescription>
                    </Field>
                  )
                }}
              />
            )}
          />
        </form>
        <Field orientation="horizontal">
          <Button className="bg-amber-900 hover:bg-amber-950" type="submit" form="formula-creation-form">
            {submitButtonText}
          </Button>
          {cancelFn &&
            <Button onClick={cancelFn}>
              Cancel
            </Button>
          }
        </Field>
      </div>
    </div>
  )
}

export default FormulaForm
