import { up } from "up-fetch";
import { z } from "zod";

const upfetch = up(fetch);

const Formula = z.object({
  id: z.number(),
  name: z.string(),
});

const Formulas = z.array(Formula);

// TODO: can zod do extension, i.e. define this and then add an id to it? yes, we can spread or .extend()
const FormulaInput = z.object({
  name: z.string(),
});

const Status = z.object({
  ok: z.boolean(),
});

export type Formulas = z.infer<typeof Formulas>;
export type Formula = z.infer<typeof Formula>;
export type FormulaInput = z.infer<typeof FormulaInput>;
export type Status = z.infer<typeof Status>;

export async function loadFormulas(accessToken: string) {
  const formulas = await upfetch(import.meta.env.VITE_API_BASE + "/formulas", {
    schema: Formulas,
    headers: { Authorization: "Bearer " + accessToken },
  });

  return formulas;
}

export async function loadFormula(accessToken: string, formulaId: number) {
  const formula = await upfetch(
    import.meta.env.VITE_API_BASE + "/formula/" + formulaId,
    {
      schema: Formula,
      headers: { Authorization: "Bearer " + accessToken },
    },
  );

  return formula;
}

export async function createFormula(
  accessToken: string,
  formula: FormulaInput,
) {
  const fullFormula = await upfetch(
    import.meta.env.VITE_API_BASE + "/formula",
    {
      method: "POST",
      body: formula,
      schema: Formula,
      headers: { Authorization: "Bearer " + accessToken },
    },
  );

  return fullFormula;
}

export async function deleteFormula(accessToken: string, formulaId: number) {
  const status = await upfetch(
    import.meta.env.VITE_API_BASE + "/formula/" + formulaId,
    {
      method: "DELETE",
      schema: Status,
      headers: { Authorization: "Bearer " + accessToken },
    },
  );

  return status;
}
